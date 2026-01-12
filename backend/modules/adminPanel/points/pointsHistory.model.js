const mongoose = require("mongoose");

const pointHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    },
    history: {
        type: String,
        required: true
    },
    points:{
        type: Number,
    },
    time: Date,
    status: {
        type: String,
        enum: ["credit", "debit"]
    }
}, { timestamps: true });

const PointsHistory = mongoose.model("PointsHistory", pointHistorySchema);
module.exports = PointsHistory;