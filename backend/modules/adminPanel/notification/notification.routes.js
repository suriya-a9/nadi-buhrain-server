const express = require('express');
const router = express.Router();
const Notification = require('./notification.model');

router.get('/', async (req, res) => {
    const notifications = await Notification.find().sort({ time: -1 });
    res.json({ data: notifications });
});

router.post('/mark-read/:id', async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
});

router.post('/clear-notification/:id', async (req, res) => {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
})

router.post('/clear', async (req, res) => {
    await Notification.deleteMany({});
    res.json({ success: true });
});

module.exports = router;