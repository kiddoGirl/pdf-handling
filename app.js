const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const authRoutes = require("./routes/authroutes");
const fileRoutes = require("./routes/fileroutes");
const multer = require('multer');
const crypto = require("crypto");
const { MongoClient, GridFSBucket } = require("mongodb");
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

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Connection Error:", err));




    const storage = new GridFsStorage({
        url: mongoURI,
        options: { useNewUrlParser: true, useUnifiedTopology: true },
        file: async (req, file) => {
            return new Promise((resolve, reject) => {
                crypto.randomBytes(16, (err, buf) => { // ✅ Ensure this line is correct
                    if (err) return reject(err);
                    const filename = buf.toString("hex") + path.extname(file.originalname);
                    const fileInfo = {
                        filename: filename,
                        bucketName: "uploads",
                    };
                    resolve(fileInfo);
                });
            });
        },
    });

    
  
const upload = multer({ storage });

console.log(crypto.randomBytes(16).toString("hex"));

const conn = mongoose.connection;

let bucket;

conn.once("open", () => {
    console.log("MongoDB Connected");
    bucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});


app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "File upload failed" });
    }
    console.log("Uploaded File:", req.file);
    res.json({ message: "File uploaded successfully!", file: req.file });
});


app.get("/viewer", async (req, res) => {
   
    if (!bucket) {
        return res.status(500).send("GridFS not initialized yet. Try again later.");
    }

    try {
        const files = await conn.db.collection("uploads.files").find().toArray(); // ✅ CORRECT QUERY
        res.render("viewer", { files });
    } catch (err) {
        console.error("Error fetching files:", err);
        res.status(500).send("Error fetching files");
    }
});


app.delete("/delete/:id", async (req, res) => {
    try {
        if (!bucket) {
            return res.status(500).send("GridFS not initialized. Try again later.");
        }

        const fileId = new mongoose.Types.ObjectId(req.params.id);

        // Delete file chunks and metadata from GridFS
        await conn.db.collection("uploads.chunks").deleteMany({ files_id: fileId });
        await conn.db.collection("uploads.files").deleteOne({ _id: fileId });

        res.status(200).json({ success: true, message: "File deleted successfully." });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ success: false, message: "Error deleting file." });
    }
});

app.get("/download/:id", async (req, res) => {
    try {
        if (!bucket) {
            return res.status(500).send("GridFS not initialized. Try again later.");
        }

        const fileId = new mongoose.Types.ObjectId(req.params.id);

        const file = await conn.db.collection("uploads.files").findOne({ _id: fileId });

        if (!file) {
            return res.status(404).send("File not found.");
        }

        res.set({
            "Content-Type": file.contentType,
            "Content-Disposition": `attachment; filename="${file.filename}"`,
        });

        const downloadStream = bucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
    } catch (err) {
        console.error("Download error:", err);
        res.status(500).send("Error downloading file.");
    }
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
