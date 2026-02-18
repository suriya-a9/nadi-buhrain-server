const mongoose = require("mongoose");

const helpSupportSchema = new mongoose.Schema({
    content_en: {
        type: String
    },
    content_ar: {
        type: String
    },
    link: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const HelpSupport = mongoose.model("HelpSupport", helpSupportSchema);
module.exports = HelpSupport;