const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const moodRoutes = require("./routes/moodRoutes");

const app = express();

app.use(cors());
app.use(express.json());


connectDB();

// Root route
app.get("/", (req, res) => {
    res.send("Mental Health API is running 🚀");
});

// API routes
app.use("/api", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/mood", moodRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
