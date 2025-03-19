const { Pool } = require("pg");
require("dotenv").config(); // Ensure environment variables are loaded

const db = new Pool({
  user: "postgres",
  host: "localhost",
  database: "clinicpix",
  password: "447652$#$",
  port: 5432,
});

db.connect()
    .then(() => console.log("✅ Connected to PostgreSQL Database"))
    .catch((err) => console.error("❌ Database Connection Error:", err));

module.exports = db;
