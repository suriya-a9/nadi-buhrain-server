const mongoose = require("mongoose");

const popUpQuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: Number
});

const popUpQuestionnaireSchema = new mongoose.Schema({
    title: String,
    totalPoints: Number,
    questions: [popUpQuestionSchema],
    status:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("PopUpQuestionnaire", popUpQuestionnaireSchema);