const express = require("express");
const router = express.Router();
const { 
	signup, 
	login, 
	verifyOTP, 
	protectedRoute,
	logout // ✅ Destructured here
} = require("../controllers/authController"); // ✅ Already destructured

// Define the signup route
router.post("/signup", signup);

// Define login
router.post("/login", login);

// OTP Verification
router.post("/verify-otp", verifyOTP);

// Protected Route
router.post("/protected", protectedRoute);

// ✅ Properly defined logout
router.post("/logout", logout);

module.exports = router;