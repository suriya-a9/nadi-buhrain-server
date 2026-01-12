const mongoose = require("mongoose");

const privacyPolicySchema = new mongoose.Schema({
    title: {
        type: String
    },
    content: {
        type: String
    },
    link: {
        type: String
    },
    media: {
        type: String
    }
}, { timestamps: true });

const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacyPolicySchema);
module.exports = PrivacyPolicy;