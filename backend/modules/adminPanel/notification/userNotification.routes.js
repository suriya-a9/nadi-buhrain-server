const express = require("express");
const router = express.Router();
const UserNotification = require("./userNotification.model");
const auth = require("../../../middleware/authMiddleware");

router.post('/', auth, async (req, res) => {
    const userNotifications = await UserNotification.findById(req.user.id).sort({ time: -1 });
    res.json({ data: userNotifications });
});

module.exports = router;