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
        u.role AS user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
    `);

    // ✅ Ensure created_at is in proper ISO UTC format
    const logsWithUtc = result.rows.map((log) => ({
      ...log,
      created_at: new Date(log.created_at).toISOString()
    }));

    res.json(logsWithUtc);
  } catch (err) {
    console.error("❌ Failed to fetch audit logs:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

module.exports = router;