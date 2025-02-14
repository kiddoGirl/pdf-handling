const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    originalFilename: { type: String, required: true }, // Store original file name
    storedFilename: { type: String, required: true }, // Store system filename
    contentType: { type: String, required: true }, // File MIME type
    uploadDate: { type: Date, default: Date.now }, // Store upload time
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to user
});

module.exports = mongoose.model("File", FileSchema);
