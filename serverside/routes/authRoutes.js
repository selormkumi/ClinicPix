const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController"); // ✅ Centralized import
const { authenticateAdmin } = require("../middleware/authMiddleware"); // ✅ Import admin auth middleware

const {
	signup,
	login,
	verifyOTP,
	protectedRoute,
	logout,
	resetPassword,
	requestPasswordReset,
} = authController;

// ✅ Register a new user
router.post("/signup", signup);

// ✅ Login with email & password (sends OTP)
router.post("/login", login);

// ✅ Verify OTP after login
router.post("/verify-otp", verifyOTP);

// ✅ Protected route example
router.post("/protected", protectedRoute);

// ✅ Logout and log audit
router.post("/logout", logout);

// ✅ Request a password reset (sends token via email)
router.post("/request-password-reset", requestPasswordReset);

// ✅ Perform password reset using token
router.post("/reset-password", resetPassword);

// ✅ Admin password reset for users using token
router.post(
	"/admin-reset-password",
	authenticateAdmin,
	authController.adminResetPassword
);

module.exports = router;
