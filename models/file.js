const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    originalFilename: { type: String, required: true }, 
    storedFilename: { type: String, required: true }, 
    contentType: { type: String, required: true }, 
    uploadDate: { type: Date, default: Date.now }, 
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
});

module.exports = mongoose.model("File", FileSchema);
