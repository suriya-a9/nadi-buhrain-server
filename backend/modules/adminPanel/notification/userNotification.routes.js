const express = require("express");
const router = express.Router();
const UserNotification = require("./userNotification.model");
const auth = require("../../../middleware/authMiddleware");

router.post('/', auth, async (req, res) => {
    const userNotifications = await UserNotification.find({ userId: req.user.id }).sort({ time: -1 });
    res.json({ data: userNotifications });
});

router.post('/clear-notification/:id', auth, async (req, res) => {
    const notification = await UserNotification.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
    });
    res.json({ success: !!notification });
});

router.post('/clear', auth, async (req, res) => {
    await UserNotification.deleteMany({ userId: req.user.id });
    res.json({ success: true });
});

module.exports = router;