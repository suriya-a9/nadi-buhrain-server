const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    request: {
        type: String
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    },
    points: {
        type: String
    },
    status: {
        type: String,
        enum: ["requested", "accepted", "rejected"],
        default: "requested"
    },
    reason: {
        type: String
    }
}, { timestamps: true });

const Request = mongoose.model('Reques', requestSchema);
module.exports = Request;