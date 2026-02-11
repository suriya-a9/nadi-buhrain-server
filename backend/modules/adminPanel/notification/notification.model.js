const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: String,
    type: String,
    userId: mongoose.Schema.Types.ObjectId,
    time: Date,
    read: { type: Boolean, default: false },
    permissions: [String]
});

module.exports = mongoose.model('Notification', notificationSchema);