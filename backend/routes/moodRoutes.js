const express = require("express");

const router = express.Router();

const Mood = require("../models/Mood");
const authMiddleware = require("../middleware/authMiddleware");


// SAVE MOOD
router.post("/save", authMiddleware, async (req, res) => {

    try {

        const { mood } = req.body;

        const newMood = new Mood({
            userId: req.user.id,
            mood: mood,
            createdAt: new Date()
        });

        await newMood.save();

        res.json({ message: "Mood saved" });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Server error" });

    }

});


// GET USER MOODS
router.get("/", authMiddleware, async (req, res) => {

    try {

        const moods = await Mood.find({
            userId: req.user.id
        }).sort({ createdAt: -1 });

        res.json(moods);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Server error" });

    }

});

module.exports = router;