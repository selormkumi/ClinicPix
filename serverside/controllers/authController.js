const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/dbConfig"); // Ensure database connection
require("dotenv").config(); // Load environment variables

// ✅ User Signup (Register)
exports.signup = async (req, res) => {
    try {
        console.log("🔍 Incoming Signup Request:", { 
            role: req.body.role,
            userName: req.body.userName,
            email: req.body.email
        }); // ✅ Safe logging, no password exposed

        const { userName, email, role, password } = req.body;

        if (!userName || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user already exists
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 🔐 Hash the password before storing it
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ✅ Ensure column name `username` matches your PostgreSQL table
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role",
            [userName, email, hashedPassword, role]
        );

        console.log("✅ User successfully registered:", { 
            id: newUser.rows[0].id,
            username: newUser.rows[0].username,
            email: newUser.rows[0].email,
            role: newUser.rows[0].role
        }); // ✅ Safe logging, no password exposed

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
        console.log("🔍 Incoming Login Request:", { email: req.body.email }); // ✅ Safe logging

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find the user by email
        const user = await pool.query(
            "SELECT id, username, email, role, password FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare the entered password with the stored hashed password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 🎟 Generate JWT Token
        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
            process.env.JWT_SECRET || "your_secret_key",
            { expiresIn: "1h" }
        );

        console.log("✅ User logged in:", { 
            id: user.rows[0].id, 
            username: user.rows[0].username, 
            email: user.rows[0].email, 
            role: user.rows[0].role 
        }); // ✅ Safe logging

        res.status(200).json({
            message: "✅ Login successful",
            token,
            user: {
                id: user.rows[0].id,
                userName: user.rows[0].username, // ✅ Ensure correct column name
                email: user.rows[0].email,
                role: user.rows[0].role,
            },
        });

    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Protected Route (Requires JWT)
exports.protectedRoute = async (req, res) => {
    try {
        console.log("🔍 Received Headers:", req.headers); // ✅ Debugging log
        const token = req.header("Authorization")?.replace("Bearer ", "");
        console.log("🔍 Extracted Token:", token ? "✅ Token received" : "❌ No token found"); 

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "my_super_secret_key");

        console.log("✅ Decoded Token:", decoded); // ✅ Safe debugging

        res.status(200).json({
            message: "✅ Access granted",
            user: decoded,
        });

    } catch (err) {
        console.error("❌ Token Verification Error:", err.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};