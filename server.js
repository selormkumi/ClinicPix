require("dotenv").config();
console.log("✅ S3_BUCKET_NAME:", process.env.S3_BUCKET_NAME); // Debugging
const express = require("express");
const cors = require("cors");
const { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  ListObjectsV2Command, 
  ListObjectVersionsCommand 
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();
const PORT = process.env.PORT || 5001;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// ✅ Fix CORS Policy
app.use(cors({
  origin: "http://localhost:4200", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Middleware for JSON parsing & logging requests
app.use(express.json());
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.url}`);
  next();
});

// ✅ Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Get list of uploaded files (GET /api/files)
app.get("/api/files", async (req, res) => {
  const params = { Bucket: S3_BUCKET_NAME };

  try {
    const command = new ListObjectsV2Command(params);
    const data = await s3.send(command);

    const files = data.Contents ? data.Contents.map(file => file.Key) : [];
    console.log("✅ Retrieved files:", files);
    
    res.json({ files });
  } catch (error) {
    console.error("❌ Error retrieving files:", error);  
    res.status(500).json({ error: error.message });
  }
});

// ✅ Generate a pre-signed URL for uploading (POST /api/files/upload)
app.post("/api/files/upload", async (req, res) => {
  const { fileName, fileType } = req.body;
  if (!fileName || !fileType) {
    return res.status(400).json({ error: "Missing fileName or fileType" });
  }

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
    console.error("❌ Error generating upload URL:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Generate a pre-signed URL for viewing (GET /api/files/view/:fileName)
app.get("/api/files/view/:fileName", async (req, res) => {
  const { fileName } = req.params;
  if (!fileName) {
    return res.status(400).json({ error: "Missing fileName" });
  }

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `uploads/${fileName}`,
  };

  try {
    const command = new GetObjectCommand(params);
    const viewUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({ viewUrl });
  } catch (error) {
    console.error("❌ Error generating view URL:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a file from S3 (DELETE /api/files/delete/:fileName) - Now handles versioned deletes
app.delete("/api/files/delete/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const key = `uploads/${fileName}`; // Adjust this based on how your files are stored

  try {
    // Step 1: List all versions of the object
    const versionsData = await s3.send(new ListObjectVersionsCommand({
      Bucket: S3_BUCKET_NAME,
      Prefix: key
    }));

    if (versionsData.Versions) {
      // Step 2: Delete each version explicitly
      await Promise.all(versionsData.Versions.map(async (version) => {
        await s3.send(new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
          VersionId: version.VersionId
        }));
      }));
    }

    console.log("✅ File deleted:", fileName);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("ClinicPix Backend is running...");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});