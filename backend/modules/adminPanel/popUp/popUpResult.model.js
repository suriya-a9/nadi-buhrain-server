const mongoose = require("mongoose");

const popUpAnswerSchema = new mongoose.Schema({
    questionIndex: Number,
    question: String,
    type: String,
    options: [String],
    correctAnswer: Number,
    selectedOption: Number,
    inputValue: String,
    inputAnswer: String,
    isCorrect: Boolean
}, { _id: false });

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
    answers: [popUpAnswerSchema],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    "PopUpQuestionnaireResult",
    popUpQuestionnaireResultSchema
);