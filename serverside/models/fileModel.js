require("dotenv").config();
const {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectVersionsCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// ✅ Constants
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const KMS_KEY_ARN = "arn:aws:kms:us-east-2:135808935445:key/a507c38c-1440-434c-8ef0-db8f40ad7018";

// ✅ Validate ENV
if (!BUCKET_NAME) {
    throw new Error("❌ S3_BUCKET_NAME is not defined in .env file.");
}

// ✅ Detect if running locally (with credentials) or on EC2
const isRunningOnEC2 = !process.env.AWS_ACCESS_KEY_ID;

// ✅ Configure S3 client for either local dev or EC2 role
const s3Client = isRunningOnEC2
    ? new S3Client({ region: process.env.AWS_REGION }) // EC2 instance role
    : new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

// ✅ List all files
const listFiles = async () => {
    try {
        const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
        const data = await s3Client.send(command);

        return (data.Contents || []).map(file => ({
            fileName: file.Key.replace(/^uploads\//, ""),
            size: file.Size,
            lastModified: file.LastModified
        }));
    } catch (error) {
        console.error("❌ ERROR: Failed to list files:", error);
        throw error;
    }
};

// ✅ Generate upload URL with KMS encryption
const generateUploadUrl = async (fileName, fileType) => {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            ContentType: fileType,
            ServerSideEncryption: "aws:kms",
            SSEKMSKeyId: KMS_KEY_ARN
        });

        return await getSignedUrl(s3Client, command, { expiresIn: 300 });
    } catch (error) {
        console.error("❌ ERROR: Failed to generate upload URL:", error);
        throw error;
    }
};

// ✅ Generate view URL
const generateViewUrl = async (fileName) => {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName.replace(/^uploads\//, "")
        });

        return await getSignedUrl(s3Client, command, { expiresIn: 300 });
    } catch (error) {
        console.error("❌ ERROR: Failed to generate view URL:", error);
        throw error;
    }
};

// ✅ Generate download URL
const generateDownloadUrl = async (fileKey) => {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
            ResponseContentDisposition: "attachment"
        });

        return await getSignedUrl(s3Client, command, { expiresIn: 300 });
    } catch (error) {
        console.error("❌ ERROR: Failed to generate download URL:", error);
        throw error;
    }
};

// ✅ Delete file (versioned)
const deleteFile = async (fileName) => {
    try {
        const versionsData = await s3Client.send(new ListObjectVersionsCommand({
            Bucket: BUCKET_NAME,
            Prefix: fileName
        }));

        if (versionsData.Versions) {
            await Promise.all(versionsData.Versions.map(async (version) => {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: fileName,
                    VersionId: version.VersionId
                }));
            }));
        }

        return { message: "✅ File deleted successfully" };
    } catch (error) {
        console.error("❌ ERROR: Failed to delete file:", error);
        throw error;
    }
};

module.exports = {
    listFiles,
    generateUploadUrl,
    generateViewUrl,
    generateDownloadUrl,
    deleteFile
};