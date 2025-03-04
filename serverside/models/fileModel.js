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
 
const s3Client = new S3Client({

    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});
 
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
if (!BUCKET_NAME) {
    throw new Error("Error: S3_BUCKET_NAME is not defined in .env file.")
}
 
// ✅ List all files in the S3 bucket

const listFiles = async () => {
    try {
        const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
        const data = await s3Client.send(command);
        return data.Contents ? data.Contents.map(file => file.Key) : [];
    } catch (error) {
        console.error("❌ ERROR: Failed to list files:", error);
        throw error;
    }
};
 
// ✅ Generate a pre-signed URL for uploading files
const generateUploadUrl = async (fileName, fileType) => {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: `uploads/${fileName}`,
            ContentType: fileType
        };
 
        const command = new PutObjectCommand(params);
        return await getSignedUrl(s3Client, command, { expiresIn: 300 });
 
    } catch (error) {
        console.error("❌ ERROR: Failed to generate upload URL:", error);
        throw error;
    }

};
 
// ✅ Generate a pre-signed URL for viewing files

const generateViewUrl = async (fileName) => {

    try {
        const params = { Bucket: BUCKET_NAME, Key: `uploads/${fileName}` };
        const command = new GetObjectCommand(params);
        return await getSignedUrl(s3Client, command, { expiresIn: 300 });
    } catch (error) {
        console.error("❌ ERROR: Failed to generate view URL:", error);
        throw error;
    }
};
 
// ✅ Delete a file from S3 (Handles versioned deletes)

const deleteFile = async (fileName) => {

    try {
        const key = `uploads/${fileName}`;

        // Step 1: List all versions of the file
        const versionsData = await s3Client.send(new ListObjectVersionsCommand({ 
            Bucket: BUCKET_NAME, 
            Prefix: key 

        }));
 
        if (versionsData.Versions) {
            // Step 2: Delete each version explicitly

            await Promise.all(versionsData.Versions.map(async (version) => {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    VersionId: version.VersionId

                }));

            }));

        }
 
        return { message: "File deleted successfully" };
    } catch (error) {
        console.error("❌ ERROR: Failed to delete file:", error);
        throw error;
    }

};
 
module.exports = { listFiles, generateUploadUrl, generateViewUrl, deleteFile };

 