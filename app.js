require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const authRoutes = require("./routes/authroutes");
const fileRoutes = require("./routes/fileroutes");
const multer = require('multer');
const Grid = require('gridfs-stream');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const methodOverride = require('method-override');


const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

// MongoDB Connection
const mongoURI ="mongodb+srv://manjubashini2110:Manju03@cluster0.adkmyfp.mongodb.net/pdf-App"

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return { filename: file.originalname, bucketName: "uploads" };
    },
});
const upload = multer({ storage });


const conn = mongoose.connection;

let gfs;
conn.once("open", () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
});



app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.send(`<script>alert("File uploaded successfully!"); window.location.href = "/";</script>`);
});



app.get('/viewer', async (req, res) => {
    try {
        const files = await gfs.files.find().toArray();
        res.render('viewer', { files });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ✅ Route to Download PDF
app.get('/download/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ err: "No file exists" });
        }

        const readstream = gfs.createReadStream(file.filename);
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename=' + file.filename);
        readstream.pipe(res);
    });
});


app.get('/', (req, res) => {
    res.redirect('/signup');
});

app.get('/uploader', (req, res) => {
    res.render('uploader'); // Make sure 'uploader.ejs' exists inside the 'views' folder
});



// Routes
app.use(authRoutes);
app.use(fileRoutes);

// Server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
