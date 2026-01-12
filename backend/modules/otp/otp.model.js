const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    },
    otp: {
        type: String,
    },
    expiresAt: {
        type: Date
    }
}, { timestamps: true })

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;