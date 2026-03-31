const express = require('express');
const router = express.Router();
const TechNotification = require("./techNotification.model");
const auth = require("../../../middleware/authMiddleware");

router.post('/', auth, async (req, res) => {
    const techNotifications = await TechNotification.find({ userId: req.user.id }).sort({ time: -1 });
    res.json({ data: techNotifications });
})

router.post('/clear-notification/:id', auth, async (req, res) => {
    const notification = await TechNotification.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
    });
    res.json({ success: !!notification });
});

router.post('/clear', auth, async (req, res) => {
    await TechNotification.deleteMany({ userId: req.user.id });
    res.json({ success: true });
});

module.exports = router;