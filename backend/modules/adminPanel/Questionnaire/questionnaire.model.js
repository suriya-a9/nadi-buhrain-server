const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: Number 
});

const questionnaireSchema = new mongoose.Schema({
    title: String,
    totalPoints: Number,
    questions: [questionSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Questionnaire", questionnaireSchema);