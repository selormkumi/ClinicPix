require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Trust proxy for accurate IP logging behind load balancers (e.g., EC2/Nginx)
app.set("trust proxy", true);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:4200",             // Local Angular dev
  "https://clinicpix.onrender.com",    // Render frontend
  "https://clinicpix.xyz"              // Custom domain
];

// ✅ Manual CORS headers (before routes)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  // ✅ Immediately respond to preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ✅ Apply CORS middleware for safety
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const providerRoutes = require("./routes/providerRoutes");
const userRoutes = require("./routes/userRoutes");
const auditRoutes = require("./routes/auditRoutes");

// ✅ Register API endpoints
app.use("/api/auth", authRoutes);           
app.use("/api", fileRoutes);                
app.use("/api/patients", providerRoutes);   
app.use("/api/users", userRoutes);          
app.use("/api", auditRoutes);               

// ✅ Root and health check
app.get("/", (req, res) => {
  res.send("ClinicPix Backend is running...");
});

app.get("/api/test", (req, res) => {
  res.send("✅ API is live!");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});