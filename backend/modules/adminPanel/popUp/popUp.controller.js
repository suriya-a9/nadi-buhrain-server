const PopUpQuestionnaire = require("./popUp.model");
const UserLog = require("../../userLogs/userLogs.model");
const UserAccount = require("../../userAccount/userAccount.model");
const PopUpQuestionnaireResult = require("../popUp/popUpResult.model");
const PointsHistory = require("../points/pointsHistory.model");

exports.addPopUp = async (req, res, next) => {
    try {
        const { title, totalPoints, questions } = req.body;
        const popUpQuestionnaire = await PopUpQuestionnaire.create({
            title,
            totalPoints,
            questions
        })
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
            data: popUpQuestionnaire
        });
    } catch (err) {
        next(err)
    }
}

exports.editPopup = async (req, res, next) => {
    try {
        const { id, ...updateField } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            })
        }
        const questionnaire = await PopUpQuestionnaire.findByIdAndUpdate(
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

exports.deletePopUp = async (req, res, next) => {
    try {
        const { id } = req.body;
        const questionnaireData = await PopUpQuestionnaire.findByIdAndDelete(id);
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

        const questionnaire = await PopUpQuestionnaire.findById(questionnaireId);
        if (!questionnaire) {
            return res.status(404).json({
                success: false,
                message: "Questionnaire not found"
            });
        }

        const alreadySubmitted = await PopUpQuestionnaireResult.findOne({
            userId,
            questionnaireId
        });
        if (alreadySubmitted) {
            return res.status(400).json({
                success: false,
                message: "Questionnaire already submitted"
            });
        }

        const user = await UserAccount.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let correctCount = 0;
        const detailedAnswers = [];

        answers.forEach(ans => {
            const question = questionnaire.questions[ans.questionIndex];
            if (!question) return;

            let isCorrect = false;
            let answerObj = {
                questionIndex: ans.questionIndex,
                isCorrect
            };

            if (question.type === "choose") {
                isCorrect = question.correctAnswer === ans.selectedOption;
                answerObj.selectedOption = ans.selectedOption;
            } else if (question.type === "input") {
                isCorrect = true;
                answerObj.inputValue = ans.inputValue;
            }

            answerObj.isCorrect = isCorrect;
            if (isCorrect) correctCount++;

            detailedAnswers.push(answerObj);
        });

        const totalQuestions = questionnaire.questions.length;
        const percentage = (correctCount / totalQuestions) * 100;
        const pointsEarned = Math.round(
            (percentage / 100) * questionnaire.totalPoints
        );

        const updatedUser = await UserAccount.findByIdAndUpdate(
            userId,
            { $inc: { points: pointsEarned } },
            { new: true }
        );

        const result = await PopUpQuestionnaireResult.create({
            userId,
            questionnaireId,
            totalQuestions,
            correctAnswers: correctCount,
            percentage,
            pointsEarned,
            answers: detailedAnswers
        });
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
            history: `Feedback Points`,
            points: pointsEarned,
            time: new Date(),
            status: "credit"
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
        const questionnaireData = await PopUpQuestionnaire.findById(id);
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

        const questionnaireData = await PopUpQuestionnaire.findById(id);

        if (!questionnaireData) {
            return res.status(404).json({
                success: false,
                message: "No questionnaire found"
            });
        }

        const resultData = await PopUpQuestionnaireResult.find({
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
        const Questionnaires = await PopUpQuestionnaire.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Success",
            data: Questionnaires
        })
    } catch (err) {
        next(err);
    }
};

exports.statusChange = async (req, res, next) => {
    try {
        const { id, status } = req.body;
        if (!id) {
            return res.status(400).json({
                message: "Id is required"
            })
        }
        if (status === true) {
            const alreadyActive = await PopUpQuestionnaire.findOne({
                status: true,
                _id: { $ne: id }
            });

            if (alreadyActive) {
                return res.status(409).json({
                    message: "Another popup is already active. Deactivate it first."
                });
            }
        }
        const ad = await PopUpQuestionnaire.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!ad) {
            return res.status(404).json({
                message: "Popup not found."
            });
        }
        await UserLog.create({
            userId: req.user.id,
            log: "Popup Status Changed",
            status: "Status",
            role: "admin",
            logo: "/assets/advertisement.webp",
            time: new Date()
        })
        res.json({
            message: "Popup status updated successfully.",
            data: ad
        });
    } catch (err) {
        next(err)
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

        const answered = await PopUpQuestionnaireResult.find(
            { userId },
            { questionnaireId: 1, _id: 0 }
        );

        const answeredIds = answered.map(a => a.questionnaireId);

        const listData = await PopUpQuestionnaire.find({
            status: true,
            _id: { $nin: answeredIds }
        }).sort({ createdAt: -1 });


        if (listData.length === 0) {
            return res.status(400).json({
                success: false,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            data: listData
        });
    } catch (err) {
        next(err);
    }
};