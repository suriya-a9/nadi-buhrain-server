const Questionnaire = require("./questionnaire.model");
const QuestionnaireResult = require("./questionnaireResult.model");
const mongoose = require("mongoose");
const UserAccount = require("../../userAccount/userAccount.model");
const UserLog = require("../../userLogs/userLogs.model");
const QuestionnaireAssignment = require("../../adminPanel/Questionnaire/questionnaireAssignmentSchema.model");
const PointsHistory = require("../points/pointsHistory.model");
const sendMail = require("../../../utils/mailer");
const questionnaireSubmitTemplate = require("../../../template/questionnaireSubmitTemplate");

exports.addQuestionnaire = async (req, res, next) => {
    try {
        const { title, totalPoints, questions } = req.body;

        const questionnaire = await Questionnaire.create({
            title,
            totalPoints,
            questions
        });
        await UserLog.create({
            userId: req.user.id,
            log: `created questionnaire - ${title}`,
            status: "Created",
            role: "admin",
            logo: "/assets/questionnaire.webp",
            time: new Date()
        });
        res.status(201).json({
            success: true,
            data: questionnaire
        });
    } catch (err) {
        next(err);
    }
};

exports.editQuestionnaire = async (req, res, next) => {
    try {
        const { id, ...updateField } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            })
        }
        const questionnaire = await Questionnaire.findByIdAndUpdate(
            id,
            updateField,
            { new: true }
        )
        await UserLog.create({
            userId: req.user.id,
            log: `edited questionnaire ${questionnaire.title}`,
            status: "Edited",
            role: "admin",
            logo: "/assets/questionnaire.webp",
            time: new Date()
        });
        res.status(200).json({
            success: true,
            message: "success",
            data: questionnaire
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteQuestionnaire = async (req, res, next) => {
    try {
        const { id } = req.body;
        const questionnaireData = await Questionnaire.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: `deleted questionnaire ${questionnaireData.title}`,
            status: "Deleted",
            role: "admin",
            logo: "/assets/questionnaire.webp",
            time: new Date()
        });
        res.status(200).json({
            sucess: true,
            message: "success"
        })
    } catch (err) {
        next(err)
    }
}

exports.submitQuestionnaire = async (req, res, next) => {
    try {
        const { questionnaireId, answers } = req.body;
        const userId = req.user.id;

        if (!questionnaireId || !answers) {
            return res.status(400).json({
                success: false,
                message: "questionnaireId and answers are required"
            });
        }

        const questionnaire = await Questionnaire.findById(questionnaireId);
        if (!questionnaire) {
            return res.status(404).json({
                success: false,
                message: "Questionnaire not found"
            });
        }

        const user = await UserAccount.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const assignment = await QuestionnaireAssignment.findOne({
            userId,
            questionnaireId
        });
        if (!assignment) {
            return res.status(400).json({
                success: false,
                message: "Assignment not found"
            });
        }
        const requestedPoints = assignment.requestedPoints;

        let correctCount = 0;
        const detailedAnswers = [];

        answers.forEach(ans => {
            const question = questionnaire.questions[ans.questionIndex];
            if (!question) return;

            let isCorrect = false;
            let answerObj = {
                questionIndex: ans.questionIndex,
                question: question.question,
                type: question.type,
                options: question.options,
                correctAnswer: question.correctAnswer,
                isCorrect
            };

            if (question.type === "choose") {
                isCorrect = question.correctAnswer === ans.selectedOption;
                answerObj.selectedOption = ans.selectedOption;
            } else if (question.type === "input") {
                const userInput = ans.inputValue ?? ans.selectedOption ?? "";
                isCorrect = true;
                answerObj.inputValue = userInput;
                answerObj.inputAnswer = question.inputAnswer;
            }

            answerObj.isCorrect = isCorrect;
            if (isCorrect) correctCount++;

            detailedAnswers.push(answerObj);
        });

        const totalQuestions = questionnaire.questions.length;
        const percentage = (correctCount / totalQuestions) * 100;
        const pointsEarned = Math.round(
            (correctCount / totalQuestions) * requestedPoints
        );

        const updatedUser = await UserAccount.findByIdAndUpdate(
            userId,
            { $inc: { points: pointsEarned } },
            { new: true }
        );

        const result = await QuestionnaireResult.create({
            userId,
            questionnaireId,
            totalQuestions: questionnaire.questions.length,
            correctAnswers: correctCount,
            percentage: (correctCount / questionnaire.questions.length) * 100,
            pointsEarned: Math.round(
                (correctCount / questionnaire.questions.length) * assignment.requestedPoints
            ),
            answers: detailedAnswers
        });
        await QuestionnaireAssignment.updateMany(
            { userId: userId, questionnaireId: questionnaireId },
            { $set: { status: true } }
        );
        await UserLog.create({
            userId: req.user.id,
            log: `submitted questionnaire`,
            status: "submitted",
            role: "user",
            logo: "/assets/questionnaire.webp",
            time: new Date()
        });
        await PointsHistory.create({
            userId: req.user.id,
            history: `submitted questionnaire`,
            points: pointsEarned,
            time: new Date(),
            status: "credit"
        });
        await sendMail({
            to: user.basicInfo.email,
            subject: "Points Request",
            html: questionnaireSubmitTemplate({
                name: user.basicInfo.fullName
            })
        });
        res.status(201).json({
            success: true,
            message: "Questionnaire submitted successfully",
            pointsEarned,
            totalUserPoints: updatedUser.points,
            data: result
        });

    } catch (err) {
        next(err);
    }
};

exports.questionnaire = async (req, res, next) => {
    try {
        const { id } = req.body;
        const questionnaireData = await Questionnaire.findById(id);
        if (!questionnaireData) {
            return res.status(404).json({
                success: false,
                message: "no questionnaire found"
            })
        }
        res.status(200).json({
            success: true,
            message: "success",
            data: questionnaireData
        })
    } catch (err) {
        next(err)
    }
}

exports.questionnaireDetail = async (req, res, next) => {
    try {
        const { id } = req.body;

        const questionnaireData = await Questionnaire.findById(id);

        if (!questionnaireData) {
            return res.status(404).json({
                success: false,
                message: "No questionnaire found"
            });
        }

        const resultData = await QuestionnaireResult.find({
            questionnaireId: id
        })
            .populate("userId")
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            questionnaire: questionnaireData,
            results: resultData
        });

    } catch (err) {
        next(err);
    }
};

exports.listQuestionnaires = async (req, res, next) => {
    try {
        const Questionnaires = await Questionnaire.find();
        res.status(200).json({
            success: true,
            message: "Success",
            data: Questionnaires
        })
    } catch (err) {
        next(err);
    }
}

exports.listForClient = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            });
        }

        const answered = await QuestionnaireResult.find(
            { userId },
            { questionnaireId: 1, _id: 0 }
        );

        const answeredIds = answered.map(a => a.questionnaireId);

        const listData = await QuestionnaireAssignment.find({
            status: false,
            _id: { $nin: answeredIds }
        })
            .populate("questionnaireId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: listData
        });
    } catch (err) {
        next(err);
    }
};