const mongoose = require("mongoose");

const techNotificationSchema = new mongoose.Schema({
    message: String,
    type: String,
    userId: mongoose.Schema.Types.ObjectId,
    time: Date
});

module.exports = mongoose.model('TechNotification', techNotificationSchema);