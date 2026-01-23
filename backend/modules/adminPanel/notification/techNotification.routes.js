const express = require('express');
const router = express.Router();
const TechNotification = require("./techNotification.model");
const auth = require("../../../middleware/authMiddleware");

router.post('/', auth, async (req, res) => {
    const techNotifications = await TechNotification.findById(req.user.id).sort({ time: -1 });
    res.json({ data: techNotifications });
})

module.exports = router;