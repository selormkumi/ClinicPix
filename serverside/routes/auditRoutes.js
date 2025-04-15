const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

router.get("/audit-logs", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        al.id,
        al.user_id,
        al.action,
        al.details,
        al.ip_address,
        al.user_agent,
        -- ✅ No need to manually convert timezone; handled by JS
        al.created_at AS created_at,
        u.email AS user_email,
        u.username AS user_username,
        u.role AS user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
    `);

    const logs = result.rows.map((log) => ({
      ...log,
      created_at: new Date(log.created_at).toISOString()
    }));

    res.json(logs);
  } catch (err) {
    console.error("❌ Failed to fetch audit logs:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

module.exports = router;