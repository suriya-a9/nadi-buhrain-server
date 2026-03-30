const Gift = require("./gift.model");
const UserAccount = require("../../userAccount/userAccount.model");
const GiftDistribution = require("./giftDistribution.model");

exports.add = async (req, res, next) => {
    try {
        const { title, caption, totalPoints, allowedAccountTypes, targetUserIds } = req.body;

        const gift = await Gift.create({
            title,
            caption,
            totalPoints,
            allowedAccountTypes: allowedAccountTypes || [],
            targetUserIds: targetUserIds || []
        });

        let usersToUpdate = [];

        if (targetUserIds && targetUserIds.length > 0) {
            usersToUpdate = targetUserIds;
        }
        else if (allowedAccountTypes && allowedAccountTypes.length > 0) {
            const users = await UserAccount.find(
                { accountTypeId: { $in: allowedAccountTypes } },
                "_id"
            );
            usersToUpdate = users.map(u => u._id);
        }
        else {
            const users = await UserAccount.find({}, "_id");
            usersToUpdate = users.map(u => u._id);
        }


        await UserAccount.updateMany(
            { _id: { $in: usersToUpdate } },
            { $inc: { points: totalPoints } }
        );

        const distributionRecords = usersToUpdate.map(userId => ({
            giftId: gift._id,
            userId,
            pointsAssigned: totalPoints,
            read: false
        }));
        await GiftDistribution.insertMany(distributionRecords);

        res.status(201).json({
            success: true,
            message: "Gift added and points distributed",
            data: gift
        });

    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const giftList = await Gift.find();
        res.status(200).json({
            success: true,
            data: giftList
        })
    } catch (err) {
        next(err)
    }
}

exports.listGift = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const unreadGifts = await GiftDistribution.find({ userId: userId, read: false })
            .populate({
                path: 'giftId',
                select: 'title caption totalPoints'
            });

        const result = unreadGifts.map(gd => ({
            title: gd.giftId?.title,
            caption: gd.giftId?.caption,
            points: gd.pointsAssigned,
            read: gd.read
        }));

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
}

exports.markGiftsAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await GiftDistribution.updateMany(
            { userId: userId, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({
            success: true,
            message: 'All unread gifts marked as read',
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        next(err);
    }
}