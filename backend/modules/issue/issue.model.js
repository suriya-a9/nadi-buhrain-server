const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    },
    issue: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;