const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    serviceImage: {
        type: String,
    },
    serviceLogo:{
        type: String
    }
}, { timestamps: true });

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;