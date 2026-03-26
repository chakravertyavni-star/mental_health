const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const Chat = require("../models/chat");
const Mood = require("../models/Mood");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const authMiddleware = require("../middleware/authMiddleware");

// NEW
const getModePrompt = require("../utils/getModePrompt");

router.post("/chat", authMiddleware, async (req, res) => {
    try {

        // NEW: mode added
        const { message, mode = "therapist" } = req.body;

        const userId = req.user?.id;

        console.log("Incoming request:", message);
        console.log("Selected mode:", mode);

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        if (!message) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        // 🚨 Safety detection
        const dangerWords = [
            "suicide",
            "kill myself",
            "end my life",
            "want to die",
            "self harm",
            "hurt myself"
        ];

        if (dangerWords.some(word => message.toLowerCase().includes(word))) {
            return res.json({
                reply: "I'm really sorry you're feeling this much pain. You deserve support and care. It might help to talk to someone you trust or a mental health professional. You don't have to go through this alone."
            });
        }

        // 🧠 Load previous conversation history
        const history = await Chat.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        let historyText = "";

        history.reverse().forEach(chat => {
            historyText += `User: ${chat.message}\n`;
            historyText += `AI: ${chat.aiReply}\n`;
        });

        // 🧠 Get latest mood
        const latestMood = await Mood.findOne({ userId })
            .sort({ createdAt: -1 });

        const userMood = latestMood?.mood || "unknown";

        // NEW: get selected mode prompt
        const modePrompt = getModePrompt(mode);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
            ${modePrompt}

            Conversation history:
            ${historyText}

            The user's latest recorded mood from their mood tracker is: ${userMood}. 
            Use this information to understand their emotional state when responding.

            User message: ${message}

            Respond naturally like a human conversation.
            Keep response between 2 and 5 sentences.
            No markdown or formatting.
        `;

        const result = await model.generateContent(prompt);

        let reply = result.response.text();

        reply = reply.replace(/\n+/g, " ").trim();

        console.log("AI Reply:", reply);

        // 💾 Save conversation
        await Chat.create({
            userId,
            message,
            aiReply: reply,
            mood: userMood,
            mode // optional if you add mode in schema
        });

        res.json({
            reply
        });

    } catch (error) {

        console.error("AI ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }
});

module.exports = router;