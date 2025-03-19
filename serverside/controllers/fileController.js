const fileModel = require("../models/fileModel");
const db = require("../config/dbConfig");

// ✅ Get all files from S3
const getFiles = async (req, res) => {
    try {
        const files = await db.query(
            `SELECT file_name, uploaded_by, uploaded_on, tags FROM files`
        );

        res.json({
            files: files.rows.map(file => ({
                fileName: file.file_name,
                uploadedBy: file.uploaded_by,
                uploadedOn: file.uploaded_on,
                tags: file.tags ? file.tags.split(",") : []  // ✅ Convert stored string into an array
            }))
        });

    } catch (error) {
        console.error("❌ ERROR: Failed to retrieve files", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Generate pre-signed URL for uploading
const uploadFile = async (req, res) => {     
    console.log("✅ DEBUG: Received Upload Request:", req.body); 
    
    const { fileName, fileType, uploadedBy, tags } = req.body;  // ✅ Make sure tags are included

    if (!fileName || !fileType || !uploadedBy) {         
        console.log("❌ DEBUG: Missing fileName, fileType, or uploadedBy");         
        return res.status(400).json({ error: "Missing fileName, fileType, or uploadedBy" });     
    }    

    try {         
        // ✅ Generate pre-signed upload URL
        const uploadUrl = await fileModel.generateUploadUrl(fileName, fileType);

        // ✅ Store metadata in PostgreSQL
        await db.query(
            `INSERT INTO files (file_name, uploaded_by, uploaded_on, tags) 
             VALUES ($1, $2, NOW(), $3)`, 
            [fileName, uploadedBy, tags.length > 0 ? tags.join(",") : null]
        );

        res.json({ uploadUrl });    
    } catch (error) {         
        console.error("❌ ERROR: Failed to generate upload URL:", error); 
        res.status(500).json({ error: error.message }); 
    }
};


// ✅ Generate pre-signed URL for viewing a file
const viewFile = async (req, res) => {
    const { fileName } = req.params;

    if (!fileName) {
        return res.status(400).json({ error: "Missing fileName" });
    }

    try {
        const viewUrl = await fileModel.generateViewUrl(fileName);
        res.json({ viewUrl });
    } catch (error) {
        console.error("❌ ERROR: Failed to generate view URL:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete a file from S3
const deleteFile = async (req, res) => {
    const { fileName } = req.params;

    if (!fileName) {
        return res.status(400).json({ error: "Missing fileName" });
    }

    try {
        // ✅ Step 1: Delete file from S3
        await fileModel.deleteFile(fileName);

        // ✅ Step 2: Delete file record from PostgreSQL
        const dbResult = await db.query(`DELETE FROM files WHERE file_name = $1 RETURNING *`, [fileName]);

        if (dbResult.rowCount === 0) {
            return res.status(404).json({ error: "File not found in database" });
        }

        res.json({ message: "File deleted successfully from S3 and database" });

    } catch (error) {
        console.error("❌ ERROR: Failed to delete file:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateFileTags = async (req, res) => {
    const { fileName, tags } = req.body;

    if (!fileName || !tags) {
        return res.status(400).json({ error: "Missing fileName or tags" });
    }

    try {
        await db.query(`UPDATE files SET tags = $1 WHERE file_name = $2`, [tags, fileName]);
        res.json({ message: "Tags updated successfully" });
    } catch (error) {
        console.error("❌ ERROR: Failed to update tags", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getFiles, uploadFile, viewFile, deleteFile, updateFileTags };