const express = require("express");
const router = express.Router();
const multer = require("multer");
const File = require("../models/file");
const path = require("path");

// Multer Storage Setup
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Home Page: Redirect based on user role
router.get("/", async (req, res) => {
    // Check if user is logged in
    if (req.session.user) {
        // If the user is an uploader, show the uploader page
        if (req.session.user.role === "uploader") {
            return res.render("uploader", { user: req.session.user });
        }
    }

    // Viewer page should be accessible without login
    const files = await File.find().sort({ uploadDate: -1 }); // Sort by newest first
    return res.render("viewer", { files });
});

// Upload PDF (Only for Uploader)
router.post("/upload", upload.single("pdf"), async (req, res) => {
    if (!req.session.user || req.session.user.role !== "uploader") return res.redirect("/");

    console.log("Uploaded File:", req.file); // Debugging: Check file details

     await File.create({
        originalFilename: req.file.originalname, // Save original name
        filename: req.file.filename, // Store the generated filename
        contentType: req.file.mimetype,
        uploadedBy: req.session.user._id,
        uploadDate: new Date() // Ensure upload date is saved
    });

    res.redirect("/");
});

// Download PDF
router.get("/download/:id", async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send("File not found");
    res.download(`./uploads/${file.storedFilename}`, file.originalFilename);
});

module.exports = router;
