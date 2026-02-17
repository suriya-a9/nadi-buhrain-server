const AccountDeleteReason = require("./accountDeleteReasons.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.add = async (req, res, next) => {
    const { reason } = req.body;
    try {
        await AccountDeleteReason.create({
            reason
        })
        await UserLog.create({
            userId: req.user.id,
            log: "Created Reasons for account deletion",
            time: new Date(),
            status: "Added",
            logo: "/assets/trash.webp",
            role: "admin"
        })
        res.status(200).json({
            success: true,
            message: "Added Reasons"
        })
    } catch (err) {
        next(err)
    }
}

exports.update = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        await AccountDeleteReason.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        )
        await UserLog.create({
            userId: req.user.id,
            log: "Updated Reasons for account deletion",
            time: new Date(),
            status: "Updated",
            logo: "/assets/trash.webp",
            role: "admin"
        })
        res.status(200).json({
            success: true,
            message: "Updated Reasons"
        })
    } catch (err) {
        next(err)
    }
}

exports.list = async (req, res, next) => {
    try {
        const listData = await AccountDeleteReason.find();
        res.status(200).json({
            success: true,
            data: listData
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteReason = async (req, res, next) => {
    const { id } = req.body;
    try {
        await AccountDeleteReason.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: "Deleted Reasons for account deletion",
            time: new Date(),
            status: "Deleted",
            logo: "/assets/trash.webp",
            role: "admin"
        })
        res.status(200).json({
            success: true,
            message: "Deleted Reasons"
        })
    } catch (err) {
        next(err)
    }
}