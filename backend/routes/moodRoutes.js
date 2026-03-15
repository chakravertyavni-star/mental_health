const express = require("express");
const router = express.Router();

const Mood = require("../models/Mood");


// SAVE MOOD
router.post("/save", async (req, res) => {

    try {

        const { username, mood } = req.body;

        const newMood = new Mood({
            username: username,
            mood: mood,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        });

        await newMood.save();

        res.json({ message: "Mood saved" });

    } catch (error) {

        console.error(error);   // this will show the real error in terminal
        res.status(500).json({ message: "Server error" });

    }

});


// GET USER MOODS
router.get("/:username", async (req, res) => {

    try {

        const moods = await Mood.find({
            username: req.params.username
        });

        res.json(moods);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Server error" });

    }

});

module.exports = router;