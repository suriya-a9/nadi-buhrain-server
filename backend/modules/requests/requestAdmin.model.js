const mongoose = require("mongoose");

const RequestPointsAdminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    },
    points: {
        type: Number,
        required: true
    },
    reason: {
        type: String
    },
    status: {
        type: String,
        enum: ["requested", "sent questionnaire", "payment requested", "submitted"]
    },
    actionType: {
        type: String,
        enum: ["raise_payment", "send_questionnaire", null],
        default: null
    },
    questionnaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questionnaire",
        default: null
    }
}, { timestamps: true });

const RequestPointsAdmin = mongoose.model("RequestPointsAdmin", RequestPointsAdminSchema);
module.exports = RequestPointsAdmin;