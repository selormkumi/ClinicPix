require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "http://localhost:4200", methods: ["GET", "POST", "PUT", "DELETE"] }));

const fileRoutes = require("./routes/fileRoutes");

// Register API routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api", fileRoutes);
 
// Root Route
app.get("/", (req, res) => {
  res.send("ClinicPix Backend is running...");
});
 
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});