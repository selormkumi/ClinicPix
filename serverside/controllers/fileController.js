const fileModel = require("../models/fileModel");

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
    console.log("✅ DEBUG: Received Request Body:", req.body); 
    
    const { fileName, fileType } = req.body;     

    if (!fileName || !fileType) {         
        console.log("❌ DEBUG: Missing fileName or fileType");         
        return res.status(400).json({ error: "Missing fileName or fileType" });     
    }    

    try {         
        const uploadUrl = await fileModel.generateUploadUrl(fileName, fileType);        
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
        const result = await fileModel.deleteFile(fileName);
        res.json(result);
    } catch (error) {
        console.error("❌ ERROR: Failed to delete file:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getFiles, uploadFile, viewFile, deleteFile };