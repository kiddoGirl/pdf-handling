const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    contentType: { type: String, required: true }, // File MIME type (e.g., image/png)
    uploadDate: { type: Date, default: Date.now }, // Store when file was uploaded
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to user
});

module.exports = mongoose.model("File", FileSchema);
