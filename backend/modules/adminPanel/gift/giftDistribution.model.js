const mongoose = require("mongoose");

const giftDistributionSchema = new mongoose.Schema({
    giftId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gift",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount",
        required: true
    },
    pointsAssigned: {
        type: Number,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const GiftDistribution = mongoose.model("GiftDistribution", giftDistributionSchema);
module.exports = GiftDistribution;