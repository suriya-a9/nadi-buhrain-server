const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    },
    issue_en: {
        type: String,
        required: true
    },
    issue_ar: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;