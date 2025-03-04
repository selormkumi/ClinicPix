const fileModel = require("../models/fileModel");
 
const getFiles = async (req, res) => {

  try {
    const files = await fileModel.listFiles();
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
const uploadFile = async (req, res) => {     
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
        res.status(500).json({ error: error.message }); } 
    };
 
 
const viewFile = async (req, res) => {

  const { fileName } = req.params;

  if (!fileName) return res.status(400).json({ error: "Missing fileName" });
 
  try {
    const viewUrl = await fileModel.generateViewUrl(fileName);
    res.json({ viewUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
const deleteFile = async (req, res) => {

  const { fileName } = req.params;

  if (!fileName) return res.status(400).json({ error: "Missing fileName" });
 
  try {
    const result = await fileModel.deleteFile(fileName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};
 
module.exports = { getFiles, uploadFile, viewFile, deleteFile };