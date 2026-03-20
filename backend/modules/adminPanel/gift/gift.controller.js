const Gift = require("./gift.model");
const UserAccount = require("../../userAccount/userAccount.model");

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