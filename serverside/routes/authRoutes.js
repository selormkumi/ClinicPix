const express = require("express");
const router = express.Router();
const { signup, login, verifyOTP, protectedRoute } = require("../controllers/authController");
 
// Define the signup route
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/protected", protectedRoute);

module.exports = router;

 