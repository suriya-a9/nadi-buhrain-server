const express = require('express');
const { StreamChat } = require('stream-chat');
const router = express.Router();
const logger = require("../../logger");

const streamClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

router.post('/token', async (req, res) => {
    const { userId, name } = req.body;
    await streamClient.upsertUser({
        id: userId,
        name: name || "",
    });
    const token = streamClient.createToken(userId);
    res.json({ token });
    logger.info("upserting userid", userId);
    logger.info("token", token)
});

module.exports = router;