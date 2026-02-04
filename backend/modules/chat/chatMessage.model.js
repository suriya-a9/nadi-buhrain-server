const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "UserAccount" },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "UserAccount" },
    fromRole: { type: String, enum: ["user", "admin"], required: true },
    toRole: { type: String, enum: ["user", "admin"], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);