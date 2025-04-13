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

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:4200",             // Local Angular dev
  "https://clinicpix.onrender.com",    // Render frontend
  "https://clinicpix.xyz"              // Custom domain
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl/postman) or matching ones
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Preflight requests support
app.options("*", cors());

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const providerRoutes = require("./routes/providerRoutes");
const userRoutes = require("./routes/userRoutes");
const auditRoutes = require("./routes/auditRoutes"); // ✅ Audit log route

// ✅ Register API endpoints
app.use("/api/auth", authRoutes);           // e.g., /api/auth/login, /signup
app.use("/api", fileRoutes);                // File upload/view/delete
app.use("/api/patients", providerRoutes);   // Provider ↔ patients
app.use("/api/users", userRoutes);          // User profile
app.use("/api", auditRoutes);               // Audit logs

// ✅ Root and health check
app.get("/", (req, res) => {
  res.send("ClinicPix Backend is running...");
});

app.get("/api/test", (req, res) => {
  res.send("✅ API is live!");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});