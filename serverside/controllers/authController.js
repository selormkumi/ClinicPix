const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/dbConfig");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { logAudit } = require("../utils/auditLogger");

// ✅ User Signup (Register)
exports.signup = async (req, res) => {
	try {
		console.log("🔍 Incoming Signup Request:", {
			role: req.body.role,
			userName: req.body.userName,
			email: req.body.email,
		});

		const { userName, email, role, password } = req.body;

		if (!userName || !email || !password || !role) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const userExists = await pool.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);

		if (userExists.rows.length > 0) {
			return res.status(400).json({ message: "User already exists" });
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const newUser = await pool.query(
			"INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role",
			[userName, email, hashedPassword, role]
		);

		await logAudit({
			userId: newUser.rows[0].id,
			action: "signup",
			details: `User registered with role ${role}`,
			req: req,
		});

		res.status(201).json({
			message: "✅ User registered successfully",
			user: newUser.rows[0],
		});
	} catch (err) {
		console.error("❌ Signup Error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ User Login
exports.login = async (req, res) => {
	try {
		console.log("🔍 Incoming Login Request:", { email: req.body.email });

		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" });
		}

		const userQuery = await pool.query(
			"SELECT id, username, email, role, password FROM users WHERE email = $1",
			[email]
		);

		if (userQuery.rows.length === 0) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const user = userQuery.rows[0];
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const otp = Math.floor(100000 + Math.random() * 900000);
		const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
		const hashedOtp = await bcrypt.hash(otp.toString(), 10);

		await pool.query(
			"UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE email = $3",
			[hashedOtp, otpExpires, email]
		);

		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		await transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: "Your ClinicPix OTP Code",
			text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
		});

		await logAudit({
			userId: user.id,
			action: "login_attempt",
			details: `OTP sent to ${email}`,
			req: req,
		});

		res.status(200).json({
			message: "🔑 OTP sent. Please verify to complete login.",
			email: email,
		});
	} catch (err) {
		console.error("❌ Login Error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ OTP Verification at Login
exports.verifyOTP = async (req, res) => {
	try {
		const { email, otp } = req.body;

		if (!email || !otp) {
			return res.status(400).json({ message: "Email and OTP are required" });
		}

		// Fetch user details from the database
		const userQuery = await pool.query(
			"SELECT id, username, role, email, otp_code, otp_expires_at FROM users WHERE email = $1",
			[email]
		);

		if (userQuery.rows.length === 0) {
			return res.status(400).json({ message: "Invalid email or OTP" });
		}

		const { id, username, role, otp_code, otp_expires_at } = userQuery.rows[0];

		// Compare OTP with the hashed value in the database
		const isMatch = await bcrypt.compare(otp, otp_code);
		if (!isMatch) {
			await logAudit({
				userId: id,
				action: "OTP_FAILURE",
				details: `Invalid OTP attempt for ${email}`,
				req,
			});
			return res.status(400).json({ message: "Invalid OTP. Please try again." });
		}

		if (new Date(otp_expires_at) < new Date()) {
			await logAudit({
				userId: id,
				action: "OTP_EXPIRED",
				details: `Expired OTP for ${email}`,
				req,
			});
			return res.status(400).json({ message: "OTP expired. Request a new one." });
		}

		// Generate JWT Token
		const token = jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		// Clear OTP after successful verification
		await pool.query(
			"UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE email = $1",
			[email]
		);

		console.log("✅ OTP Verified for:", email);

		// ✅ Log audit entry for OTP verification
		await logAudit({
		  userId: id,
		  action: "otp_verified",
		  details: `OTP verified for ${email}`,
		  req,
		});
		
		await logAudit({
			userId: id,
			action: "login_success",
			details: `Login successful for ${email}`,
			req,
		});

		res.status(200).json({
			message: "✅ OTP verified successfully",
			token,
			user: {
				id,
				email,
				username: username || "Unknown",
				role,
			},
		});
	} catch (err) {
		console.error("❌ OTP Verification Error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ Protected Route (Requires JWT)
exports.protectedRoute = async (req, res) => {
	try {
		console.log("🔍 Received Headers:", req.headers);
		const token = req.header("Authorization")?.replace("Bearer ", "");
		console.log("🔍 Extracted Token:", token ? "✅ Token received" : "❌ No token found");

		if (!token) {
			return res
				.status(401)
				.json({ message: "Unauthorized - No token provided" });
		}

		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log("✅ Decoded Token:", decoded);	

		res.status(200).json({
			message: "✅ Access granted",
			user: decoded,
		});
	} catch (err) {
		console.error("❌ Token Verification Error:", err.message);
		res.status(401).json({ message: "Invalid or expired token" });
	}
};

// ✅ User Logout
exports.logout = async (req, res) => {
	const { userId, email } = req.body;

	try {
		await logAudit({
			userId,
			action: "logout_success",
			details: `Logout successful for ${email || "unknown"}`,
			req,
		});

		res.status(200).json({ message: "✅ Logout logged" });
	} catch (err) {
		console.error("❌ Logout audit log failed:", err);
		res.status(500).json({ message: "Failed to log logout" });
	}
};
