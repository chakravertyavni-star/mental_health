const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// SIGNUP
router.post("/signup", async (req, res) => {

    const { username, email, password } = req.body;

    try {

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.json({
            message: "User registered successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

});


// LOGIN
router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        // 🔑 Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            username: user.username,
            token
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

});

module.exports = router;