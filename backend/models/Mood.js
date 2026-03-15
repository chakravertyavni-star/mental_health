const mongoose = require("mongoose");

const MoodSchema = new mongoose.Schema({

  username: String,
  mood: String,
  date: String,
  time: String

}, { versionKey:false });

module.exports = mongoose.model("Mood", MoodSchema);