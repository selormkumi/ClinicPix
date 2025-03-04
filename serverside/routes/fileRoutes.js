const express = require("express");
const router = express.Router();
const fileModel = require("../models/fileModel");
const fileController = require("../controllers/fileController");
 
// Define API routes

router.get("/files", fileController.getFiles);
router.post("/files/upload", async (req, res) => {

    console.log("✅ DEBUG: Received Request Body:", req.body); // Debugging
 
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

});

router.get("/files/view/:fileName", fileController.viewFile);
router.delete("/files/delete/:fileName", fileController.deleteFile);
 
module.exports = router;

 