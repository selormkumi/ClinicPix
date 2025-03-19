const fileModel = require("../models/fileModel");
const db = require("../config/dbConfig");

// ✅ Get all files from S3
const getFiles = async (req, res) => {
    try {
        const files = await fileModel.listFiles();

        if (!files || files.length === 0) {
            console.log("🚨 No files found in S3.");
            return res.json({ files: [] });
        }

        console.log("✅ Files Retrieved:", files);

        res.json({
            files: files.map(file => ({
                fileName: file.fileName, // Correct file name
                size: file.size,
                lastModified: file.lastModified
            }))
        });

    } catch (error) {
        console.error("❌ ERROR: Failed to retrieve files", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Generate pre-signed URL for uploading
const uploadFile = async (req, res) => {     
    const { fileName, fileType, uploadedBy, tags } = req.body;     

    if (!fileName || !fileType || !uploadedBy) {         
        return res.status(400).json({ error: "Missing fileName or fileType" });     
    }    

    try {         
        const uploadUrl = await fileModel.generateUploadUrl(fileName, fileType);

        // ✅ Store metadata in PostgreSQL
        await db.query(
            `INSERT INTO files (file_name, uploaded_by, uploaded_on, tags) 
             VALUES ($1, $2, NOW(), $3)`,
            [fileName, uploadedBy, JSON.stringify(tags)]
        );

        res.json({ uploadUrl });    
    } catch (error) {         
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

module.exports = { getFiles, uploadFile, viewFile, deleteFile };