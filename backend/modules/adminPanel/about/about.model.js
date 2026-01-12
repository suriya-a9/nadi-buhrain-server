const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
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

const About = mongoose.model("About", aboutSchema);
module.exports = About;