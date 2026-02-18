const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
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
    version: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const About = mongoose.model("About", aboutSchema);
module.exports = About;