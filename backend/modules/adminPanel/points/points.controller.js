const Points = require('./points.model');
const UserAccount = require('../../userAccount/userAccount.model');
const Request = require('../../requests/request.model');
const UserLog = require("../../userLogs/userLogs.model");
const PointsHistory = require("./pointsHistory.model");
const RequestPointsAdmin = require("../../requests/requestAdmin.model");
const UserNotification = require("../notification/userNotification.model");
const sendPushNotification = require("../../../utils/sendPush");
const Notification = require('../../adminPanel/notification/notification.model');
const FamilyMember = require('../../userAccount/familyMember.model');
const QuestionnaireAssignment = require("../../adminPanel/Questionnaire/questionnaireAssignmentSchema.model");

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
            role: "admin",
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
            role: "admin",
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
            role: "user",
            logo: "/assets/badge.webp",
            time: new Date()
        });
        await sendPushNotification(
            receiver.fcmToken,
            "Points Request",
            `New request for points ${points} by ${sender.basicInfo.fullName}`
        );
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
                history: `Received points from family member from ${receiver.basicInfo.fullName}`,
                points: points,
                time: new Date(),
                status: "credit"
            });
            await PointsHistory.create({
                userId: receiver._id,
                history: `Transferred points to family member ${sender.basicInfo.fullName}`,
                points: points,
                time: new Date(),
                status: "debit"
            });
            await UserNotification.create({
                type: 'Points Request',
                message: `Request Accepted by ${receiver.basicInfo.fullName}`,
                userId: sender._id,
                time: new Date()
            });
            await sendPushNotification(
                sender.fcmToken,
                "Request Accepted",
                `${receiver.basicInfo.fullName} accepted your request. ${points} added`
            );

            request.status = "accepted";
            await request.save();
            await UserLog.create({
                userId: req.user.id,
                log: "Accepted the point request",
                status: "Accepted",
                role: "user",
                logo: "/assets/badge.webp",
                time: new Date()
            });
            return res.status(200).json({ message: "Points transferred successfully" });
        } else if (action === "reject") {
            // if (!reason) {
            //     return res.status(400).json({ message: 'Reason is required for rejection' });
            // }
            request.status = "rejected";
            // request.reason = reason;
            await request.save();
            await UserLog.create({
                userId: req.user.id,
                log: "Rejected the point request",
                status: "Rejected",
                role: "user",
                logo: "/assets/badge.webp",
                time: new Date()
            });
            await UserNotification.create({
                type: 'Points Request',
                message: `Request Rejected by ${receiver.basicInfo.fullName}`,
                userId: sender._id,
                time: new Date()
            });
            await sendPushNotification(
                sender.fcmToken,
                "Request Rejected",
                `Your points request rejected`
            );
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
        const userId = req.user.id;
        const { peopleId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: 'User id is required'
            });
        }

        if (!peopleId) {
            return res.status(400).json({
                message: 'peopleId is required'
            });
        }

        const requestList = await Request.find({
            $or: [
                { senderId: userId, receiverId: peopleId },
                { senderId: peopleId, receiverId: userId }
            ]
        });

        return res.status(200).json({
            data: requestList
        });

    } catch (err) {
        next(err);
    }
};

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
            role: "user",
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
            .populate("userId").sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Success",
            data: list
        })
    } catch (err) {
        next(err)
    }
}

exports.listClientPointAdminRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            });
        }

        const request = await RequestPointsAdmin.findOne({ userId });

        if (!request) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        return res.status(200).json({
            image: "/assets/mail-logo.jpg",
            name: "Nadi Bahrain"
        });

    } catch (err) {
        next(err);
    }
};

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
            const userId = request.userId;
            const user = await UserAccount.findById(userId)
            await sendPushNotification(
                user.fcmToken,
                "Points Request",
                `Questionnaire assigned for your points request by Nadi Bahrain`
            );
            await QuestionnaireAssignment.create({
                userId: request.userId,
                questionnaireId
            });
        }

        await request.save();

        res.status(200).json({ message: "Action updated", data: request });
    } catch (err) {
        next(err);
    }
};

exports.pointsHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        const userHistory = await PointsHistory.find({ userId: userId });
        res.status(200).json({
            success: true,
            data: userHistory
        })
    } catch (err) {
        next(err)
    }
}

exports.listFamilyMembersWithPoints = async (req, res, next) => {
    try {
        let userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id required" });
        }

        const currentUser = await UserAccount.findById(userId);

        let ownerDoc = null;

        if (currentUser && currentUser.isFamilyMember && currentUser.familyOwnerId) {
            ownerDoc = await UserAccount.findById(currentUser.familyOwnerId)
                .select("basicInfo.fullName basicInfo.mobileNumber basicInfo.email basicInfo.image points accountTypeId familyMemberRef");
            userId = currentUser.familyOwnerId;
        }

        const familyMembers = await UserAccount.find({
            familyOwnerId: userId,
            isFamilyMember: true,
            _id: { $ne: currentUser._id }
        }).select("basicInfo.fullName basicInfo.mobileNumber basicInfo.email basicInfo.image points familyMemberRef");

        let allMembers = familyMembers.map(fm => fm.toObject());
        if (ownerDoc) {
            allMembers.unshift(ownerDoc.toObject());
        }

        const familyMemberRefs = allMembers.map(fm => fm.familyMemberRef).filter(Boolean);
        const relations = await FamilyMember.find({ _id: { $in: familyMemberRefs } })
            .select("relation");

        const relationMap = {};
        relations.forEach(r => {
            relationMap[r._id.toString()] = r.relation;
        });

        const data = allMembers.map(fm => ({
            ...fm,
            relation: relationMap[fm.familyMemberRef?.toString()] || null
        }));

        res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
};

exports.requestedList = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({
                message: 'User id is required'
            });
        }

        const requestList = await Request.find({
            status: "requested",
            $or: [
                { senderId: req.user.id },
                { receiverId: req.user.id }
            ]
        })
            .populate("senderId");

        return res.status(200).json({
            data: requestList
        });

    } catch (err) {
        next(err);
    }
};

exports.peopleList = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            });
        }

        const requests = await Request.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        });

        const peopleIds = new Set();
        requests.forEach(req => {
            if (req.senderId.toString() !== userId) peopleIds.add(req.senderId.toString());
            if (req.receiverId.toString() !== userId) peopleIds.add(req.receiverId.toString());
        });

        const people = await UserAccount.find({ _id: { $in: Array.from(peopleIds) } })
            .select("basicInfo.fullName basicInfo.mobileNumber basicInfo.email basicInfo.image points");

        res.status(200).json({
            success: true,
            data: people
        });
    } catch (err) {
        next(err);
    }
}

exports.requestWithOutMobileNumber = async (req, res, next) => {
    const { receiverId, points, reason } = req.body;
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(400).json({
                message: 'User id is required'
            });
        }
        const sender = await UserAccount.findById(userId);
        const receiver = await UserAccount.findById(receiverId);
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
            role: "user",
            logo: "/assets/badge.webp",
            time: new Date()
        });
        await sendPushNotification(
            receiver.fcmToken,
            "Points Request",
            `New request for points ${points} by ${sender.basicInfo.fullName}`
        );
        res.status(201).json({
            message: "Request sent"
        });
    } catch (err) {
        next(err);
    }
}