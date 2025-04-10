const db = require("../config/dbConfig");

/**
 * Logs user actions to the audit_logs table.
 *
 * @param {Object} params
 * @param {number} params.userId - ID of the user performing the action.
 * @param {string} params.action - Type of action performed (e.g., login, update_profile).
 * @param {string} [params.details=""] - Optional description/details of the action.
 * @param {object} [params.req] - The Express request object for IP and user-agent extraction.
 */
async function logAudit({ userId, action, details = "", req }) {
	try {
		// ✅ Use smart IP extraction logic and support proxy headers
		const ipAddress =
			process.env.LOG_IP === "false"
				? ""
				: req?.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
				  req?.ip ||
				  req?.connection?.remoteAddress ||
				  "";

		const userAgent = req?.get("User-Agent") || "";

		await db.query(
			`INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
			 VALUES ($1, $2, $3, $4, $5)`,
			[userId, action, details, ipAddress, userAgent]
		);

		console.log("📝 Audit log saved:", action);
	} catch (err) {
		console.error("❌ Failed to log audit event:", err);
	}
}

module.exports = { logAudit };