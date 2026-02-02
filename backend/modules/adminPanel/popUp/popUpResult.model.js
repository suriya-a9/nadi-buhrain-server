const mongoose = require("mongoose");

const popUpQuestionnaireResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount",
        required: true
    },
    questionnaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PopUpQuestionnaire",
        required: true
    },
    totalQuestions: Number,
    correctAnswers: Number,
    percentage: Number,
    pointsEarned: Number,
    answers: [
        {
            questionIndex: Number,
            selectedOption: Number,
            isCorrect: Boolean
        }
    ],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    "PopUpQuestionnaireResult",
    popUpQuestionnaireResultSchema
);