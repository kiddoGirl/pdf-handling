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
    if (!req.session.user) return res.redirect("/login");

    if (req.session.user.role === "uploader") {
        return res.render("uploader", { user: req.session.user });
    } else {
        const files = await File.find();
        return res.render("viewer", { user: req.session.user, files });
    }
});

// Upload PDF (Only for Uploader)
router.post("/upload", upload.single("pdf"), async (req, res) => {
    if (!req.session.user || req.session.user.role !== "uploader") return res.redirect("/");

    await File.create({
        filename: req.file.filename,
        path: req.file.path,
        uploadedBy: req.session.user._id,
    });

    res.redirect("/");
});

// Download PDF
router.get("/download/:id", async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send("File not found");
    res.download(file.path, file.filename);
});

module.exports = router;
