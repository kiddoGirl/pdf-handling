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

// Home Page
router.get("/", async (req, res) => {
    
    if (req.session.user) {
        
        if (req.session.user.role === "uploader") {
            return res.render("uploader", { user: req.session.user });
        }
    }

    
    const files = await File.find().sort({ uploadDate: -1 }); 
    return res.render("viewer", { files });
});

// Upload PDF 
router.post("/upload", upload.single("pdf"), async (req, res) => {
    if (!req.session.user || req.session.user.role !== "uploader") return res.redirect("/");

    console.log("Uploaded File:", req.file); 

     await File.create({
        originalFilename: req.file.originalname, 
        filename: req.file.filename, 
        contentType: req.file.mimetype,
        uploadedBy: req.session.user._id,
        uploadDate: new Date() 
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
