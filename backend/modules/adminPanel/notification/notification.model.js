const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: String,
    type: String,
    userId: mongoose.Schema.Types.ObjectId,
    time: Date,
    read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);