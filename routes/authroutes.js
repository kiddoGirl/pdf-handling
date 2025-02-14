const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect("/login");
}

// ✅ Login Page
router.get("/login", (req, res) => res.render("login", { error: null }));

// ✅ Handle Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request received:", req.body);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(400).send("User not found");
        }

        console.log("Stored Hashed Password:", user.password);
        console.log("Entered Plain Password:", password);

        // Compare plain password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match Result:", isMatch);

        if (!isMatch) {
            console.log("Password comparison failed.");
            return res.status(400).send("Invalid credentials");
        }

        req.session.user = user; // Store user in session

        // Redirect based on role
        if (user.role === "viewer") {
            return res.redirect("/viewer");
        } else {
            return res.redirect("/uploader");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
    }
});



// ✅ Signup Page
router.get("/signup", (req, res) => res.render("signup", { error: null }));

// ✅ Handle Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log("Signup request received:", req.body);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        // Create new user (WITHOUT hashing manually)
        const newUser = new User({
            name,
            email,
            password, // Directly store plain password, let Mongoose middleware hash it
            role,
        });

        await newUser.save();

        // Fetch stored user to verify password is stored correctly
        const savedUser = await User.findOne({ email });
        console.log("Stored Hashed Password (after saving):", savedUser.password);

        req.session.user = newUser; // Store user in session

        // Redirect based on role
        if (role === "viewer") {
            return res.redirect("/viewer");
        } else {
            return res.redirect("/uploader");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error signing up");
    }
});





// ✅ Logout Route
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;
