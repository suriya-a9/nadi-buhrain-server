const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
    points: {
        type: Number
    },
    accountType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    }
}, { timestamps: true });

const Points = mongoose.model("Points", pointsSchema);
module.exports = Points