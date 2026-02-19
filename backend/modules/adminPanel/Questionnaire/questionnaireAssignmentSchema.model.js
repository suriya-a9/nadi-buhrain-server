const mongoose = require("mongoose");

const questionnaireAssignmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount",
        required: true
    },
    questionnaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questionnaire",
        required: true
    },
    requestedPoints: { 
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    assignedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("QuestionnaireAssignment", questionnaireAssignmentSchema);