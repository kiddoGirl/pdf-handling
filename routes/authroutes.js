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

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'User not found!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Incorrect password!' });
        }

        req.session.user = { id: user._id, name: user.name, role: user.role };

        // Redirect based on role
        if (user.role === 'uploader') {
            res.redirect('/uploader');
        } else {
            res.redirect('/viewer');
        }

    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Login failed. Try again.' });
    }
});


// Signup Page
router.get("/signup", (req, res) => res.render("signup", { error: null }));

router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.render('signup', { error: 'User already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        
        req.session.user = { id: user._id, name: user.name, role: user.role };
        if (user.role === 'uploader') {
            res.redirect('/uploader');
        } else {
            res.redirect('/viewer');
        }

    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Signup failed. Try again.' });
    }
});


module.exports = router;

