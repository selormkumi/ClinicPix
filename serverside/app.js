require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Trust proxy for accurate IP logging behind load balancers (e.g., EC2/Nginx)
app.set("trust proxy", true); // 👈 Important for accurate IPs when deployed

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS for Angular frontend
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const providerRoutes = require("./routes/providerRoutes");
const userRoutes = require("./routes/userRoutes");
const auditRoutes = require("./routes/auditRoutes"); // ✅ New audit log routes

// ✅ Register API routes
app.use("/auth", authRoutes);                  // Auth routes (login/register)
app.use("/api", fileRoutes);                   // File management routes
app.use("/api/patients", providerRoutes);      // Provider-patient related routes
app.use("/api/users", userRoutes);             // User profile routes
app.use("/api", auditRoutes);                  // ✅ Audit log route

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("ClinicPix Backend is running...");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});