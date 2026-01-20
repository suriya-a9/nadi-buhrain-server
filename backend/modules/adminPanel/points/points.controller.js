const Points = require('./points.model');
const UserAccount = require('../../userAccount/userAccount.model');
const Request = require('../../requests/request.model');
const UserLog = require("../../userLogs/userLogs.model");
const PointsHistory = require("./pointsHistory.model");
const RequestPointsAdmin = require("../../requests/requestAdmin.model");
const UserNotification = require("../notification/userNotification.model");
const sendPushNotification = require("../../../utils/sendPush");
const Notification = require('../../adminPanel/notification/notification.model');

exports.addPoints = async (req, res, next) => {
    const { points, accountType } = req.body;
    try {
        const pointsData = await Points.create({
            points,
            accountType
        })
        await UserLog.create({
            userId: req.user.id,
            log: `${points} added to ${accountType}`,
            status: "Added",
            logo: "/assets/badge.webp.webp",
            time: new Date()
        });
        res.status(201).json({
            message: "points added",
            data: pointsData
        })
    } catch (err) {
        next(err);
    }
}

exports.listPoints = async (req, res, next) => {
    try {
        const pointsList = await Points.find()
            .populate("accountType");
        res.status(200).json({
            data: pointsList
        })
    } catch (err) {
        next(err)
    }
}

exports.updatePoints = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        const updatedPoints = await Points.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );
        await UserLog.create({
            userId: req.user.id,
            log: `${updatedPoints.points} Points updated`,
            status: "Updated",
            logo: "/assets/badge.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "Updated successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.requestPointsToFamily = async (req, res, next) => {
    const { mobileNumber, points, reason } = req.body;
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(400).json({
                message: 'User id is required'
            });
        }
        const sender = await UserAccount.findById(userId);
        const receiver = await UserAccount.findOne({ "basicInfo.mobileNumber": mobileNumber });
        if (!receiver) {
            return res.status(404).json({
                message: 'Receiver not found'
            });
        }
        const userNotification = await UserNotification.create({
            type: 'Points Request',
            message: `New request from ${sender.basicInfo.fullName}`,
            userId: receiver._id,
            time: new Date()
        });
        await Request.create({
            request: "Requesting points transfer",
            senderId: req.user.id,
            receiverId: receiver._id,
            points,
            reason
        });
        const io = req.app.get('io');
        io.emit('userNotification', userNotification);
        await UserLog.create({
            userId: req.user.id,
            log: `${points} points requested`,
            status: "Requested",
            logo: "/assets/badge.webp",
            time: new Date()
        });
        res.status(201).json({
            message: "Request sent"
        });
    } catch (err) {
        next(err);
    }
};

exports.transferPointsWithFamily = async (req, res, next) => {
    const { requestId, action, reason } = req.body;
    try {
        if (!requestId || !action) {
            return res.status(400).json({ message: 'requestId and action are required' });
        }

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.status !== "requested") {
            return res.status(400).json({ message: 'Request already processed' });
        }

        const sender = await UserAccount.findById(request.senderId);
        const receiver = await UserAccount.findById(request.receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        if (action === "accept") {
            const points = Number(request.points);
            if (!receiver.points || receiver.points < points) {
                return res.status(400).json({ message: 'Family member does not have enough points' });
            }
            receiver.points -= points;
            sender.points = Number(sender.points || 0) + points;

            await receiver.save();
            await sender.save();

            await PointsHistory.create({
                userId: sender._id,
                history: "Received points from family member",
                points: points,
                time: new Date(),
                status: "credit"
            });
            await PointsHistory.create({
                userId: receiver._id,
                history: "Transferred points to family member",
                points: points,
                time: new Date(),
                status: "debit"
            });
            await sendPushNotification(
                sender.fcmToken,
                "Request Accepted",
                `Accepted Point is ${points}`
            );

            request.status = "accepted";
            await request.save();
            await UserLog.create({
                userId: req.user.id,
                log: "Accepted the point request",
                status: "Accepted",
                logo: "/assets/badge.webp",
                time: new Date()
            });
            return res.status(200).json({ message: "Points transferred successfully" });
        } else if (action === "reject") {
            if (!reason) {
                return res.status(400).json({ message: 'Reason is required for rejection' });
            }
            request.status = "rejected";
            request.reason = reason;
            await request.save();
            await UserLog.create({
                userId: req.user.id,
                log: "Rejected the point request",
                status: "Rejected",
                logo: "/assets/badge.webp",
                time: new Date()
            });
            return res.status(200).json({ message: "Request rejected" });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }
    } catch (err) {
        next(err);
    }
};

exports.requestList = async (req, res, next) => {
    try {
        if (!req.user.id) {
            return res.status(400).json({
                message: 'User id is required'
            });
        }
        const requestList = await Request.find({
            $or: [
                { senderId: req.user.id },
                { receiverId: req.user.id }
            ]
        });
        if (requestList.length === 0) {
            return res.status(200).json({
                message: "no request data"
            });
        }
        res.status(200).json({
            data: requestList
        })
    } catch (err) {
        next(err);
    }
}

exports.requestToAdmin = async (req, res, next) => {
    const { points, reason } = req.body;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "User id needed"
            })
        }
        const user = await UserAccount.findById(userId);
        await RequestPointsAdmin.create({
            userId: userId,
            points,
            status: "requested",
            reason
        });
        const notification = await Notification.create({
            type: 'Request',
            message: `${points} points requested by ${user.basicInfo.fullName}`,
            userId: user._id,
            time: new Date(),
            read: false
        });
        const io = req.app.get('io');
        io.emit('notification', notification);
        await UserLog.create({
            userId: req.user.id,
            log: `${points} points requested`,
            status: "Requested to nadi bahrain",
            logo: "/assets/badge.webp",
            time: new Date()
        });
        res.status(200).json({
            success: true,
            message: "Success"
        })
    } catch (err) {
        next(err)
    }
}

exports.listAdminRequest = async (req, res, next) => {
    try {
        const list = await RequestPointsAdmin.find()
            .populate("userId");
        res.status(200).json({
            success: true,
            message: "Success",
            data: list
        })
    } catch (err) {
        next(err)
    }
}

exports.handleAdminRequestAction = async (req, res, next) => {
    const { requestId, actionType, questionnaireId } = req.body;
    try {
        const request = await RequestPointsAdmin.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (!["raise_payment", "send_questionnaire"].includes(actionType)) {
            return res.status(400).json({ message: "Invalid actionType" });
        }

        request.actionType = actionType;

        if (actionType === "raise_payment") {
            request.status = "payment requested";
        } else if (actionType === "send_questionnaire") {
            if (!questionnaireId) {
                return res.status(400).json({ message: "questionnaireId required" });
            }
            request.status = "sent questionnaire";
            request.questionnaireId = questionnaireId;
        }

        await request.save();

        res.status(200).json({ message: "Action updated", data: request });
    } catch (err) {
        next(err);
    }
};