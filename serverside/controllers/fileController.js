const fileModel = require("../models/fileModel");
const db = require("../config/dbConfig");
const { logAudit } = require("../utils/auditLogger");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// ✅ Get all files with uploader's username
const getFiles = async (req, res) => {
    const { uploadedBy } = req.query; // Get provider ID from request

    if (!uploadedBy) {
        return res.status(400).json({ error: "Missing uploadedBy parameter" });
    }

    try {
        const files = await db.query(
            `SELECT f.file_name, u.username AS uploaded_by, u.email AS uploader_email, f.uploaded_on, f.tags 
             FROM files f
             JOIN users u ON f.uploaded_by = u.id
             WHERE f.uploaded_by = $1`,  // Only get the provider's own files
            [uploadedBy]
        );

        res.json({
            files: files.rows.map(file => ({
                fileName: file.file_name,
                fileUrl: `https://your-s3-bucket.s3.amazonaws.com/providers/${uploadedBy}/${file.file_name}`,
                uploadedBy: file.uploaded_by,
                uploaderEmail: file.uploader_email,
                uploadedOn: file.uploaded_on,
                tags: file.tags ? file.tags.split(",") : []
            }))
            
        });

    } catch (error) {
        console.error("❌ ERROR: Failed to retrieve files", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Generate pre-signed URL for uploading and store metadata
const uploadFile = async (req, res) => {
    let { fileName, fileType, uploadedBy, tags } = req.body;

    if (!fileName || !fileType || !uploadedBy) {
        console.log("❌ DEBUG: Missing fileName, fileType, or uploadedBy");
        return res.status(400).json({ error: "Missing fileName, fileType, or uploadedBy" });
    }

    try {
        // Ensure uploadedBy is a number
        uploadedBy = Number(uploadedBy);

        // Check if the user exists
        const userResult = await db.query(`SELECT id FROM users WHERE id = $1`, [uploadedBy]);

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Step 2: Generate pre-signed upload URL
        const fileKey = `providers/${uploadedBy}/${fileName}`;
        const uploadUrl = await fileModel.generateUploadUrl(fileKey, fileType);

        // ✅ Step 3: Store metadata in PostgreSQL
        await db.query(
            `INSERT INTO files (file_name, uploaded_by, uploaded_on, tags) 
             VALUES ($1, $2, NOW(), $3)`,
            [
              fileName,
              uploadedBy,
              (Array.isArray(tags) && tags.length > 0) ? tags.join(",") : null,
            ]
          );
        
        // ✅ Audit Log: upload_image
        await logAudit({
            userId: uploadedBy,
            action: "upload_image",
            details: `Uploaded image ${fileName} to providers/${uploadedBy}/`,
            req,
          });

        res.json({ uploadUrl });

    } catch (error) {
        console.error("❌ ERROR: Failed to generate upload URL:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get user ID by email
const getUserIdByEmail = async (req, res) => {

    const { email } = req.query;
    try {
        const user = await db.query("SELECT id FROM users WHERE email = $1", [email]);

        if (user.rows.length > 0) {
            res.json({ userId: user.rows[0].id });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("❌ ERROR: Database query failed", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Generate pre-signed URL for viewing a file
const viewFile = async (req, res) => {
    const { fileName } = req.params;

    if (!fileName) {
        return res.status(400).json({ error: "Missing fileName" });
    }

    try {
        const fileData = await db.query(`SELECT uploaded_by FROM files WHERE file_name = $1`, [fileName]);

        if (fileData.rowCount === 0) {
            return res.status(404).json({ error: "File not found in database" });
        }

        const uploadedBy = fileData.rows[0].uploaded_by;  
        const fileKey = `providers/${uploadedBy}/${fileName}`;
        const viewUrl = await fileModel.generateViewUrl(fileKey);
        
        // ✅ Audit Log: view_image
		const currentUser = req.body.userId || req.query.userId || uploadedBy; // Use user ID if passed, else fallback
		await logAudit({
			userId: currentUser,
			action: "view_image",
			details: `Viewed image ${fileName} from providers/${uploadedBy}/`,
			req,
		});

        res.json({ viewUrl });

    } catch (error) {
        console.error("❌ ERROR: Failed to generate view URL:", error);
        res.status(500).json({ error: error.message });
    }
};


// ✅ Delete a file from S3 and database
const deleteFile = async (req, res) => {
    const { fileName } = req.params;

    if (!fileName) {
        return res.status(400).json({ error: "Missing fileName" });
    }

    try {
        // ✅ Retrieve uploadedBy from database
        const fileData = await db.query(`SELECT uploaded_by FROM files WHERE file_name = $1`, [fileName]);

        if (fileData.rowCount === 0) {
            return res.status(404).json({ error: "File not found in database" });
        }

        const uploadedBy = fileData.rows[0].uploaded_by;  // ✅ Extract provider ID
        const fileKey = `providers/${uploadedBy}/${fileName}`; // ✅ Correct S3 path

        // ✅ Step 1: Delete file from S3
        await fileModel.deleteFile(fileKey);

        // ✅ Step 2: Delete file record from PostgreSQL
        const dbResult = await db.query(`DELETE FROM files WHERE file_name = $1 RETURNING *`, [fileName]);

        if (dbResult.rowCount === 0) {
            return res.status(404).json({ error: "File not found in database" });
        }

        await logAudit({
            userId: uploadedBy,
            action: "delete_image",
            details: `Deleted image ${fileName} from providers/${uploadedBy}/`,
            req,
          });          

        res.json({ message: "File deleted successfully from S3 and database" });

    } catch (error) {
        console.error("❌ ERROR: Failed to delete file:", error);
        res.status(500).json({ error: error.message });
    }
};


// ✅ Share a file with a patient using user IDs
const shareFile = async (req, res) => {
	const { fileName, uploadedBy, sharedWith, expiresIn } = req.body;

	if (!fileName || !uploadedBy || !sharedWith || !expiresIn) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	try {
		const sharedWithId = Number(sharedWith);

		const userResult = await db.query(`SELECT id FROM users WHERE id = $1`, [sharedWithId]);
		if (userResult.rowCount === 0) return res.status(404).json({ error: "User not found" });

		const fileResult = await db.query(`SELECT id FROM files WHERE file_name = $1`, [fileName]);
		if (fileResult.rowCount === 0) return res.status(404).json({ error: "File not found" });

		const fileId = fileResult.rows[0].id;

		// ✅ Generate and hash a shared token
		const rawToken = crypto.randomBytes(32).toString("hex");
		const hashedToken = await bcrypt.hash(rawToken, 10);

		await db.query(
			`INSERT INTO shared_files (file_id, uploaded_by, shared_with, shared_on, expires_at, shared_token_hash)
			 VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 second' * $4, $5)`,
			[fileId, uploadedBy, sharedWithId, expiresIn, hashedToken]
		);

		await logAudit({
			userId: uploadedBy,
			action: "share_image",
			details: `Shared image ${fileName} with user ID ${sharedWithId}`,
			req,
		});

		// ✅ Return raw token to frontend for inclusion in URL
		res.json({ message: "File shared successfully", sharedToken: rawToken });

	} catch (error) {
		console.error("❌ ERROR: Failed to share file", error);
		res.status(500).json({ error: error.message });
	}
};

// ✅ Retrieve shared files for a patient using user ID
const getSharedFiles = async (req, res) => {
    const { sharedWith } = req.query; // sharedWith is the patient/user ID

    if (!sharedWith) {
        return res.status(400).json({ error: "Missing sharedWith parameter" });
    }

    try {
        const sharedFiles = await db.query(
            `SELECT f.file_name, u.username AS shared_by, u.email AS shared_by_email, sf.shared_on, sf.expires_at, f.tags, f.uploaded_by
             FROM shared_files sf
             JOIN files f ON sf.file_id = f.id
             JOIN users u ON sf.uploaded_by = u.id
             WHERE sf.shared_with = $1 AND sf.expires_at > NOW()`,
            [sharedWith]
        );

        res.json({ sharedFiles: sharedFiles.rows });
    } catch (error) {
        console.error("❌ ERROR: Failed to fetch shared files", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Revoke file sharing (Provider removes access for a patient)
const revokeSharedFile = async (req, res) => {
    const { fileName, uploadedBy, sharedWith } = req.body;

    if (!fileName || !uploadedBy || !sharedWith) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Delete the shared record from the database
        const result = await db.query(
            `DELETE FROM shared_files 
             WHERE file_id = (SELECT id FROM files WHERE file_name = $1) 
             AND uploaded_by = $2 
             AND shared_with = $3 
             RETURNING *`,
            [fileName, uploadedBy, sharedWith]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Shared record not found" });
        }

        // ✅ Log audit
        await logAudit({
            userId: uploadedBy,
            action: "revoke_image_access",
            details: `Revoked access to image ${fileName} shared with patient user ID ${sharedWith}`,
            req,
        });

        res.json({ message: "File sharing revoked successfully" });
    } catch (error) {
        console.error("❌ ERROR: Failed to revoke file sharing", error);
        res.status(500).json({ error: error.message });
    }
};

const getProviderSharedFiles = async (req, res) => {
	const { uploadedBy } = req.query;

	if (!uploadedBy) {
		return res.status(400).json({ error: "Missing uploadedBy parameter" });
	}

	try {
		const result = await db.query(
            `SELECT 
              f.file_name, 
              sf.shared_with, 
              shared_user.username AS shared_with_name,
              shared_user.email AS shared_with_email,
              sf.uploaded_by,
              upload_user.email AS shared_by_email,
              sf.shared_on, 
              sf.expires_at
            FROM shared_files sf
            JOIN files f ON sf.file_id = f.id
            JOIN users shared_user ON sf.shared_with = shared_user.id
            JOIN users upload_user ON sf.uploaded_by = upload_user.id
            WHERE sf.uploaded_by = $1
            ORDER BY sf.shared_on DESC`,
            [uploadedBy]
          );
          

		res.json({ sharedFiles: result.rows });
	} catch (error) {
		console.error("❌ ERROR: Failed to fetch provider-shared files", error);
		res.status(500).json({ error: error.message });
	}
};

const { generateDownloadUrl } = require("../models/fileModel");

// ✅ Generate pre-signed URL for downloading a file
const getDownloadUrl = async (req, res) => {
	const { fileName, uploadedBy } = req.query;

	if (!fileName || !uploadedBy) {
		return res.status(400).json({ error: "Missing fileName or uploadedBy" });
	}

	const fileKey = `providers/${uploadedBy}/${fileName}`;
	try {
		const downloadUrl = await generateDownloadUrl(fileKey);

		const currentUser = req.body.userId || req.query.userId || uploadedBy;

		await logAudit({
			userId: currentUser,
			action: "download_image",
			details: `Downloaded image ${fileName} from ${fileKey}`,
			req,
		});

		res.json({ downloadUrl });
	} catch (error) {
		console.error("❌ ERROR: Failed to generate download URL:", error);
		res.status(500).json({ error: error.message });
	}
};

module.exports = { 
	getFiles, 
	uploadFile, 
	viewFile, 
	deleteFile, 
	shareFile, 
	getSharedFiles, 
	getUserIdByEmail, 
	revokeSharedFile, 
	getProviderSharedFiles, 
	getDownloadUrl
};
