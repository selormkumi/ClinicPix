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

// ✅ Share a file
router.post("/files/share", fileController.shareFile);

// ✅ Get shared files
router.get("/files/shared", fileController.getSharedFiles);

// ✅ Get user ID by email
router.get("/user-id", fileController.getUserIdByEmail);

// ✅ Revoke file sharing
router.post("/files/revoke", fileController.revokeSharedFile);

module.exports = router;