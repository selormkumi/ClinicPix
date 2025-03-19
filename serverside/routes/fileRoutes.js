const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

// ✅ Get all files
router.get("/files", fileController.getFiles);

// ✅ Upload a new file (get a pre-signed URL)
router.post("/files/upload", fileController.uploadFile);

// ✅ Get pre-signed URL to view a file
router.get("/files/view/:fileName", fileController.viewFile);

// ✅ Delete a file
router.delete("/files/delete/:fileName", fileController.deleteFile);

module.exports = router;