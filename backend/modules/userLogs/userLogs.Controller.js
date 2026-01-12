const UserLogs = require("./userLogs.model");
const UserAccount = require("../userAccount/userAccount.model");
const Technician = require("../adminPanel/technician/technician.model");
const Admin = require("../admin/admin.model");

async function getUserNameById(userId) {
    let user = await UserAccount.findById(userId).select("basicInfo.fullName basicInfo.email");
    if (user) return user.basicInfo.fullName || user.basicInfo.email;

    let tech = await Technician.findById(userId).select("firstName lastName name email");
    if (tech) return tech.firstName ? `${tech.firstName} ${tech.lastName || ""}` : tech.name || tech.email;

    let admin = await Admin.findById(userId).select("name email");
    if (admin) return admin.name || admin.email;

    return "Unknown User";
}

exports.listLogs = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        const logData = await UserLogs.find({ userId: userId }).sort({ time: -1 });

        const logsWithNames = await Promise.all(logData.map(async log => {
            const name = await getUserNameById(log.userId);
            return { ...log.toObject(), userName: name };
        }));

        res.status(200).json({
            success: true,
            data: logsWithNames
        });
    } catch (err) {
        next(err);
    }
}

exports.listAllUserLogs = async (req, res, next) => {
    try {
        const logData = await UserLogs.find().sort({ time: -1 });

        const logsWithNames = await Promise.all(logData.map(async log => {
            const name = await getUserNameById(log.userId);
            return { ...log.toObject(), userName: name };
        }));

        res.status(200).json({
            success: true,
            data: logsWithNames
        });
    } catch (err) {
        next(err);
    }
}

exports.viewLogDetails = async (req, res, next) => {
    const { id } = req.body;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "log id required"
            })
        }
        const logData = await UserLogs.findById(id);
        res.status(200).json({
            success: true,
            data: logData
        })
    } catch (err) {
        next(err)
    }
}