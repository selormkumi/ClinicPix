require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Generate a pre-signed URL for uploading
app.post("/generate-presigned-url", async (req, res) => {
  const { fileName, fileType } = req.body;

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `uploads/${fileName}`,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({ uploadUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Failed to generate URL" });
  }
});

// Generate a pre-signed URL for viewing
app.get("/get-presigned-url/:fileName", async (req, res) => {
  const { fileName } = req.params;

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `uploads/${fileName}`,
  };

  try {
    const command = new GetObjectCommand(params);
    const viewUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({ viewUrl });
  } catch (error) {
    console.error("Error generating view URL:", error);
    res.status(500).json({ error: "Failed to generate URL" });
  }
});

// Delete a file from S3
app.delete("/delete-image/:fileName", async (req, res) => {
  const { fileName } = req.params;

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `uploads/${fileName}`,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

app.get("/", (req, res) => {
  res.send("ClinicPix Backend is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
