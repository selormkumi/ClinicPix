const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");
const { logAudit } = require("../utils/auditLogger");

// ✅ Assign patient
router.post("/assign", async (req, res) => {
  const { providerId, patientEmail } = req.body;
  try {
    const user = await db.query(`SELECT id, role FROM users WHERE email = $1`, [patientEmail]);
    if (user.rowCount === 0 || user.rows[0].role !== "patient") {
      return res.status(400).json({ error: "Patient not found or not a patient role" });
    }

    const patientId = user.rows[0].id;
    await db.query(
      `INSERT INTO provider_patients (provider_id, patient_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [providerId, patientId]
    );

    // ✅ Log audit
    await logAudit({
      userId: providerId,
      action: "assigned_patient",
      details: `Provider userID ${providerId} assigned with patient userID ${patientId}`,
      req,
    });

    res.json({ message: "Patient assigned successfully" });
  } catch (error) {
    console.error("❌ ERROR assigning patient:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ GET: All unassigned patients for a specific provider
router.get("/all-patient-emails/:providerId", async (req, res) => {
  const providerId = req.params.providerId;

  try {
    const result = await db.query(
      `SELECT u.id, u.email, up.name
       FROM users u
       JOIN user_profiles up ON u.id = up.user_id
       WHERE u.role = 'patient'
       AND u.id NOT IN (
         SELECT patient_id FROM provider_patients WHERE provider_id = $1
       )`,
      [providerId]
    );
    res.json({ patients: result.rows });
  } catch (error) {
    console.error("❌ ERROR fetching unassigned patient emails:", error);
    res.status(500).json({ error: "Failed to fetch patient emails" });
  }
});

// ✅ Get all patients assigned to a provider (UPDATED)
router.get("/:providerId", async (req, res) => {
  const providerId = req.params.providerId;
  try {
    const result = await db.query(
      `SELECT u.id, u.email, p.name, p.phone
       FROM provider_patients pp
       JOIN users u ON pp.patient_id = u.id
       JOIN user_profiles p ON u.id = p.user_id
       WHERE pp.provider_id = $1`,
      [providerId]
    );
    res.json({ patients: result.rows });
  } catch (error) {
    console.error("❌ ERROR fetching patients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ DELETE: Remove assigned patient
router.delete("/unassign", async (req, res) => {
  const { providerId, patientId } = req.body;

  try {
    const result = await db.query(
      `DELETE FROM provider_patients WHERE provider_id = $1 AND patient_id = $2 RETURNING *`,
      [providerId, patientId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No such assignment found" });
    }

    // ✅ Log audit for unassignment
    await logAudit({
      userId: providerId,
      action: "unassigned_patient",
      details: `Provider userID ${providerId} unassigned patient userID ${patientId}`,
      req,
    });

    res.json({ message: "Patient unassigned successfully" });
  } catch (error) {
    console.error("❌ ERROR unassigning patient:", error);
    res.status(500).json({ error: "Failed to unassign patient" });
  }
});

module.exports = router;