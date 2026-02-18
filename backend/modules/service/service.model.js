const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
    name_en: {
        type: String,
        required: true
    },
    name_ar: {
        type: String
    },
    serviceImage: {
        type: String,
    },
    serviceLogo: {
        type: String
    },
    points: {
        type: String
    }
}, { timestamps: true });

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;