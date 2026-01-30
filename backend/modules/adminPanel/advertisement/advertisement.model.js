const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema({
    ads: [
        {
            image: {
                type: String,
                required: true
            },
            link: {
                type: String,
                required: true
            }
        }
    ],
    video: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Advertisement", advertisementSchema);