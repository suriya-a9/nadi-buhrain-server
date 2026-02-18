const mongoose = require('mongoose');

const termsSchema = new mongoose.Schema({
    content_en: {
        type: String,
        required: true,
    },
    content_ar: {
        type: String,
        required: true,
    },
    enabled: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Terms = mongoose.model("Terms", termsSchema);
module.exports = Terms;