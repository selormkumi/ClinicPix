require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");

const app = express();
const PORT = process.env.PORT || 5001;
 
// Middleware
app.use(cors({ origin: "http://localhost:4200", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // ✅ Parses URL-encoded requests
 
// API Routes
app.use("/api", fileRoutes);
 
// Root Route
app.get("/", (req, res) => {
  res.send("ClinicPix Backend is running...");
});
 
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});