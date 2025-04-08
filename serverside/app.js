require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS for Angular frontend
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const providerRoutes = require("./routes/providerRoutes");
const userRoutes = require("./routes/userRoutes"); // ✅ Added this

// ✅ Register API routes
app.use("/auth", authRoutes);                  // Auth routes (login/register)
app.use("/api", fileRoutes);                   // File management routes
app.use("/api/patients", providerRoutes);      // Provider-patient related routes
app.use("/api/users", userRoutes);             // ✅ User profile routes

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("ClinicPix Backend is running...");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});