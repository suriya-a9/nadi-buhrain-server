const express = require("express");
const ChatMessage = require("./chatMessage.model");
const router = express.Router();

router.get("/history", async (req, res) => {
    const { user1, user2 } = req.query;
    const messages = await ChatMessage.find({
        $or: [
            { from: user1, to: user2 },
            { from: user2, to: user1 }
        ]
    }).sort({ createdAt: 1 });
    res.json(messages);
});

router.post("/mark-read", async (req, res) => {
    const { from, to } = req.body;

    await ChatMessage.updateMany(
        {
            from,
            to,
            read: false
        },
        { $set: { read: true } }
    );

    res.json({ success: true });
});

router.get("/unread", async (req, res) => {
    const { userId } = req.query;

    const messages = await ChatMessage.find({
        to: userId,
        read: false
    }).select("from");

    res.json(messages);
});

module.exports = router;