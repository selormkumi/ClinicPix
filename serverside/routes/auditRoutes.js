const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

router.get("/audit-logs", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        al.*, 
        u.email AS user_email,
        u.username AS user_username,
        u.id AS user_id,
        u.role AS user_role,
        al.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS created_at_est
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch audit logs:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

module.exports = router;