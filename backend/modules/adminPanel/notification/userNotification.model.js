const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
    message: String,
    type: String,
    userId: mongoose.Schema.Types.ObjectId,
    time: Date
});

module.exports = mongoose.model('UserNotification', userNotificationSchema);