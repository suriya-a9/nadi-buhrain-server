const UserAccount = require('../../userAccount/userAccount.model');
const Points = require('../points/points.model');
const FamilyMember = require('../../userAccount/familyMember.model');
const Address = require('../../address/address.model');
const UserLog = require('../../userLogs/userLogs.model');
const PointsHistory = require("../points/pointsHistory.model");
const sendPushNotification = require("../../../utils/sendPush");
const sendMail = require("../../../utils/mailer");
const accountVerificationStatusTemplate = require("../../../template/accountVerificationStatus.template");
const UserNotification = require("../notification/userNotification.model");

exports.verifyAccount = async (req, res, next) => {
    const { userId, status, reason } = req.body;
    try {
        if (!userId || !status) {
            return res.status(400).json({ message: "userId and status required" });
        }
        if (!["verified", "rejected", "processing"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const user = await UserAccount.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let updateFields = { accountVerification: status };

        if (status === "rejected") {
            if (!reason) {
                return res.status(400).json({ message: "Reason required for rejection" });
            }
            updateFields.reason = reason;
        }
        if (status === "verified") {
            updateFields.accountStatus = true;
        }
        const pointsDoc = await Points.findOne({ accountType: user.accountTypeId });
        if (pointsDoc && (!user.points || user.points === 0)) {
            updateFields.points = pointsDoc.points;
            await PointsHistory.create({
                userId: user._id,
                history: "Signup points",
                points: pointsDoc.points,
                time: new Date(),
                status: "credit"
            });
        }
        const result = await UserAccount.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        );
        await UserLog.create({
            userId: req.user.id,
            log: `Account verification has been done for user ${user.basicInfo.fullName}`,
            status: "Account Verification",
            role: "admin",
            logo: "/assets/verification.webp",
            time: new Date()
        })
        if (user.notification) {
            await sendPushNotification(
                user.fcmToken,
                "Account verification",
                `Your account has been verified.`
            );
        }
        await UserNotification({
            message: "Account verified",
            type: "Verification",
            userId: user._id,
            time: new Date()
        })
        try {
            await sendMail({
                to: user.basicInfo.email,
                subject: "Account Verification Status",
                html: accountVerificationStatusTemplate({
                    name: user.basicInfo.fullName,
                    status,
                    reason: reason || ""
                })
            });
        } catch (mailErr) {
            console.error("Failed to send verification email:", mailErr);
        }
        res.status(200).json({ message: "Account verification updated", data: result });
    } catch (err) {
        next(err);
    }
}

exports.usersLists = async (req, res, next) => {
    try {
        const userList = await UserAccount.find({ singnUpCompleted: true, status: "completed", });
        const count = userList.length;
        res.status(200).json({
            success: true,
            data: userList,
            count: count
        })
    } catch (err) {
        next(err)
    }
}

exports.verificaionAccountList = async (req, res, next) => {
    try {
        const users = await UserAccount.find({
            status: "completed",
            singnUpCompleted: true,
            accountVerification: { $in: ["not verified", "rejected"] }
        })
            .populate('accountTypeId')
            .lean();

        const familyMembers = await FamilyMember.find().lean();
        const combined = [...users];

        for (const fm of familyMembers) {
            const exists = await UserAccount.findOne({ "basicInfo.email": fm.email }).lean();
            if (exists) continue;

            let parentAccountType = null;
            if (fm.userId) {
                const parent = await UserAccount.findById(fm.userId).populate('accountTypeId').lean();
                parentAccountType = parent?.accountTypeId || null;
            }

            combined.push({
                _id: fm._id,
                basicInfo: {
                    fullName: fm.fullName,
                    mobileNumber: fm.mobile,
                    email: fm.email,
                    gender: fm.gender
                },
                accountTypeId: parentAccountType,
                isFamilyMember: true,
                parentUserId: fm.userId,
                addressId: fm.addressId || null,
                accountVerification: "not verified",
                createdAt: fm.createdAt
            });
        }

        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            data: combined
        });
    } catch (err) {
        next(err)
    }
}

exports.viewAccount = async (req, res, next) => {
    const { id } = req.body;
    try {
        const accountData = await UserAccount.findById(id)
            .populate('accountTypeId')
            .populate('familyOwnerId')
            .lean();

        if (accountData) {
            const userAddresses = await Address.find({ userId: accountData._id })
                .populate('roadId', 'name')
                .populate('blockId', 'name')
                .lean();

            const familyMembers = await FamilyMember.find({ userId: accountData._id }).lean();
            const familyWithAddress = await Promise.all(familyMembers.map(async fm => {
                const addr = fm.addressId
                    ? await Address.findById(fm.addressId)
                        .populate('roadId', 'name')
                        .populate('blockId', 'name')
                        .lean()
                    : null;
                return { ...fm, address: addr || null };
            }));

            let parentUser = null;
            if (accountData.isFamilyMember && accountData.familyOwnerId) {
                parentUser = await UserAccount.findById(accountData.familyOwnerId)
                    .populate('accountTypeId')
                    .lean();
            }

            return res.status(200).json({
                data: {
                    type: 'user',
                    user: accountData,
                    addresses: userAddresses,
                    familyMembers: familyWithAddress,
                    parentUser: parentUser
                }
            });
        }

        const fm = await FamilyMember.findById(id).lean();
        if (fm) {
            const parentUser = fm.userId ? await UserAccount.findById(fm.userId).populate('accountTypeId').lean() : null;
            const addr = fm.addressId ? await Address.findById(fm.addressId).lean() : null;
            return res.status(200).json({
                data: {
                    type: 'familyMember',
                    familyMember: fm,
                    address: addr || null,
                    parentUser: parentUser || null
                }
            });
        }

        return res.status(404).json({ message: 'data not found' });
    } catch (err) {
        next(err)
    }
}

exports.usersList = async (req, res, next) => {
    try {
        const listacceptedUsers = await UserAccount.find({ accountVerification: "verified" })
            .populate("accountTypeId")
            .populate().sort({ createdAt: -1 })
        res.status(200).json({
            data: listacceptedUsers
        })
    } catch (err) {
        next(err)
    }
}

exports.setUserStatus = async (req, res, next) => {
    const { id, status } = req.body;
    try {
        const user = await UserAccount.findByIdAndUpdate(id, { accountStatus: status }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        const userData = await UserAccount.findById(id);
        await UserLog.create({
            userId: req.user.id,
            log: ` ${userData.basicInfo.fullName} - Account Disabled`,
            status: "Account Disabling",
            role: "admin",
            logo: "/assets/disabled.webp",
            time: new Date()
        })
        res.status(200).json({
            message: "user status updated",
            data: user
        });
    } catch (err) {
        next(err);
    }
};