const express = require('express');
const router = express.Router();
const db = require('../config/dbConfig');
const { logAudit } = require('../utils/auditLogger'); // ✅ For logging profile updates

// ✅ GET all users - for admin
router.get("/all", async (req, res) => {
	try {
		console.log("📌 Fetching all users...");
		const result = await db.query(`
			SELECT id, username, email, role FROM users
		`);
		console.log("✅ Users found:", result.rows);
		res.json(result.rows);
	} catch (error) {
		console.error("❌ Failed to fetch users:", error.stack);
		res.status(500).json({ error: "Failed to fetch user data" });
	}
});

// ✅ Get full profile (email from users, others from user_profiles)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        u.email,
        u.role,
        p.name,
        p.dob,
        p.state,
        p.country,
        p.age,
        p.weight,
        p.height,
        p.address,
        p.phone
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rowCount > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// ✅ Save or update profile data in user_profiles
router.put('/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  const {
    name, dob, state, country, age,
    weight, height, address, phone
  } = req.body;

  try {
    const existing = await db.query("SELECT 1 FROM user_profiles WHERE user_id = $1", [userId]);

    if (existing.rowCount > 0) {
      // Update
      await db.query(`
        UPDATE user_profiles SET 
          name = $1, dob = $2, state = $3, country = $4,
          age = $5, weight = $6, height = $7, address = $8,
          phone = $9
        WHERE user_id = $10
      `, [name, dob, state, country, age, weight, height, address, phone, userId]);
    } else {
      // Insert
      await db.query(`
        INSERT INTO user_profiles (
          user_id, name, dob, state, country,
          age, weight, height, address, phone
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `, [userId, name, dob, state, country, age, weight, height, address, phone]);
    }

    // ✅ Log audit
    await logAudit({
      userId,
      action: "update_profile",
      details: `Profile updated for user ID ${userId}`,
      req,
    });

    res.json({ message: "Profile saved successfully." });
  } catch (error) {
    console.error("❌ Error saving user profile:", error);
    res.status(500).json({ error: "Failed to save user profile" });
  }
});

module.exports = router;