const PrivacyPolicy = require("./privacyPolicy.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.addPolicy = async (req, res, next) => {
    const { title, content, link } = req.body;
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            })
        }
        const media = req.files?.media?.[0]?.filename;
        const privacyData = await PrivacyPolicy.create({
            title,
            content,
            link,
            media
        })
        await UserLog.create({
            userId: userId,
            log: `Created ${privacyData.title} privacy policy content`,
            status: "Created",
            logo: "/assets/privacy-policy.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "Created Successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.listPrivacy = async (req, res, next) => {
    try {
        const privacyData = await PrivacyPolicy.find();
        res.status(200).json({
            success: true,
            message: "Success",
            data: privacyData
        })
    } catch (err) {
        next(err)
    }
}

exports.updatePrivacy = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            })
        }
        if (req.files?.media) {
            updateFields.media = req.files.media[0].filename;
        }
        const privacyUpdate = await PrivacyPolicy.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );
        await UserLog.create({
            userId: userId,
            log: `Updated ${privacyUpdate.title} privacy policy content`,
            status: "Updated",
            logo: "/assets/privacy-policy.webp",
            time: new Date()
        });
        res.status(200).json({
            success: true,
            message: "Updated Successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.deletePrivacy = async (req, res, next) => {
    const { id } = req.body;
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            })
        }
        const privacyData = await PrivacyPolicy.findByIdAndDelete(id);
        await UserLog.create({
            userId: userId,
            log: `Deleted ${privacyData.title} privacy policy content`,
            status: "Deleted",
            logo: "/assets/privacy-policy.webp",
            time: new Date()
        });
        res.status(200).json({
            success: true,
            message: "Deleted Successfully"
        })
    } catch (err) {
        next(err)
    }
}