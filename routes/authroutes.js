const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect("/login");
}

// Login 
router.get("/login", (req, res) => res.render("login", { error: null }));

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request received:", req.body);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.render("login", { error: "User not found" });
        }

        console.log("Stored Hashed Password:", user.password);
        console.log("Entered Plain Password:", password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match Result:", isMatch);

        if (!isMatch) {
            console.log("Password comparison failed.");
            return res.render("login", { error: "Invalid credentials" });
        }

        req.session.user = user; 

       
        if (user.role === "viewer") {
            return res.redirect("/viewer");
        } else {
            return res.redirect("/uploader");
        }
    } catch (err) {
        console.error(err);
        res.render("login", { error: "Error logging in" });
    }
});



// Signup 
router.get("/signup", (req, res) => res.render("signup", { error: null }));

//Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log("Signup request received:", req.body);

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", { error: "User already exists" });
        }

        
        const newUser = new User({
            name,
            email,
            password, 
            role,
        });

        await newUser.save();

        
        const savedUser = await User.findOne({ email });
        console.log("Stored Hashed Password (after saving):", savedUser.password);

        req.session.user = newUser; 

        
        if (role === "viewer") {
            return res.redirect("/viewer");
        } else {
            return res.redirect("/uploader");
        }
    } catch (err) {
        console.error(err);
        res.render("signup", { error: "Error signing up" });
    }
});








// Logout Route
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;
