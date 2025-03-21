const { Pool } = require("pg");
require("dotenv").config(); // Load environment variables
const fs = require("fs");
const path = require("path");

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, "../certificates/us-east-2-bundle.pem")).toString(),
  },
});

db.connect()
  .then(() => console.log(`✅ Connected to AWS RDS PostgreSQL Database`))
  .catch((err) => console.error("❌ Database Connection Error:", err));

module.exports = db;