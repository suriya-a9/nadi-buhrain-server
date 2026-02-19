const mongoose = require("mongoose");

const helpAndSupportEnquirySchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: Number
    },
    message: {
        type: String
    },
    email: {
        type: String
    }
}, { timestamps: true });

const HelpAndSupportEnquiry = mongoose.model("HelpAndSupportEnquiry", helpAndSupportEnquirySchema);
module.exports = HelpAndSupportEnquiry;