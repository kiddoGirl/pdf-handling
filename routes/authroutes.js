const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect("/login");
}

// Login Page
router.get("/login", (req, res) => res.render("login", { error: null }));

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid credentials");
        }

        req.session.user = user; // ✅ Store user in session

        // ✅ Redirect based on role
        if (user.role === "viewer") {
            return res.redirect("/viewer");
        } else {
            return res.redirect("/dashboard");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
    }
});


// Signup Page
router.get("/signup", (req, res) => res.render("signup", { error: null }));

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role, // "viewer" or "admin"
        });

        await newUser.save();

        // ✅ Set session/cookie to track login
        req.session.user = newUser;

        // ✅ Redirect to viewer page
        if (role === "viewer") {
            return res.redirect("/viewer"); // Make sure this route exists!
        } else {
            return res.redirect("/dashboard"); // Redirect admin elsewhere
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error signing up");
    }
});



module.exports = router;

