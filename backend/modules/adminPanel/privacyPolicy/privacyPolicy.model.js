const mongoose = require("mongoose");

const privacyPolicySchema = new mongoose.Schema({
    title: {
        type: String
    },
    content_en: {
        type: [String]
    },
    content_ar: {
        type: [String]
    },
    link: {
        type: String
    },
    media: {
        type: String
    },
    subs: {
        type: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacyPolicySchema);
module.exports = PrivacyPolicy;