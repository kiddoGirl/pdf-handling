const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("File", FileSchema);
