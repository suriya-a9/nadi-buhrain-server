const HelpSupport = require("./helpAndSupport.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.addHelp = async (req, res, next) => {
    const { content_en, content_ar, link } = req.body;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "User id needed"
            })
        }
        await HelpSupport.create({
            content_en,
            content_ar,
            link
        })
        await UserLog.create({
            userId: userId,
            log: `Created help and support content`,
            status: "Created",
            role: "admin",
            logo: "/assets/help-support.webp",
            time: new Date()
        })
        res.status(201).json({
            success: true,
            message: "Created successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.userList = async (req, res, next) => {
    try {
        const lang = req.query.lang || "en";
        const helpData = await HelpSupport.find({ isActive: true });
        const data = helpData.map(item => {
            const obj = item.toObject();
            obj.content = lang === "ar" ? obj.content_ar : obj.content_en;
            delete obj.content_en;
            delete obj.content_ar;
            return obj;
        });
        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        next(err)
    }
}

exports.list = async (req, res, next) => {
    try {
        const helpData = await HelpSupport.find();
        res.status(200).json({
            success: true,
            data: helpData
        })
    } catch (err) {
        next(err)
    }
}

exports.updateHelp = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "User id needed"
            })
        }
        await HelpSupport.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        )
        await UserLog.create({
            userId: userId,
            log: `Updated help and support content`,
            status: "Updated",
            role: "admin",
            logo: "/assets/help-support.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "Updated successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.toggleStatus = async (req, res, next) => {
    const { id, isActive } = req.body;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "User id needed"
            })
        }
        await HelpSupport.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        )
        await UserLog.create({
            userId: userId,
            log: `Updated help and support content status`,
            status: "Updated",
            role: "admin",
            logo: "/assets/help-support.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "Updated successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteHelp = async (req, res, next) => {
    const { id } = req.body;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "User id needed"
            })
        }
        await HelpSupport.findByIdAndDelete(id)
        await UserLog.create({
            userId: userId,
            log: `Deleted help and support content`,
            status: "Deleted",
            role: "admin",
            logo: "/assets/help-support.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "Deleted successfully"
        })
    } catch (err) {
        next(err)
    }
}