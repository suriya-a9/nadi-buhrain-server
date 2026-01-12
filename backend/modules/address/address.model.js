const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    },
    addressType: {
        type: String
    },
    city: {
        type: String
    },
    building: {
        type: String
    },
    floor: {
        type: String
    },
    aptNo: {
        type: Number
    },
    roadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Road"
    },
    blockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Block"
    }
}, { timestamps: true })

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;