const About = require("./about.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.addAbout = async (req, res, next) => {
    const { title, content, link, version, isActive = false } = req.body;
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            })
        }
        const media = req.files?.media?.[0]?.filename;
        const aboutData = await About.create({
            title,
            content,
            link,
            version,
            media,
            isActive
        })
        await UserLog.create({
            userId: userId,
            log: `Created ${aboutData.title} about content`,
            status: "Created",
            role: "admin",
            logo: "/assets/about-page.webp",
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

exports.listAbout = async (req, res, next) => {
    try {
        const aboutData = await About.find();
        res.status(200).json({
            success: true,
            message: "Success",
            data: aboutData
        })
    } catch (err) {
        next(err)
    }
}

exports.listToUser = async (req, res, next) => {
    try {
        const aboutData = await About.find({ isActive: true });
        res.status(200).json({
            success: true,
            message: "Success",
            data: aboutData
        })
    } catch (err) {
        next(err)
    }
}

exports.updateAbout = async (req, res, next) => {
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
        const aboutUpdate = await About.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );
        await UserLog.create({
            userId: userId,
            log: `Updated ${aboutUpdate.title} about content`,
            status: "Updated",
            role: "admin",
            logo: "/assets/about-page.webp",
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

exports.toggleAboutStatus = async (req, res, next) => {
    const { id, isActive } = req.body;

    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            });
        }

        const aboutData = await About.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        await UserLog.create({
            userId,
            log: `${isActive ? "Enabled" : "Disabled"} ${aboutData.title} about content`,
            status: isActive ? "Enabled" : "Disabled",
            role: "admin",
            logo: "/assets/about-page.webp",
            time: new Date()
        });

        res.status(200).json({
            success: true,
            message: `About content ${isActive ? "enabled" : "disabled"} successfully`
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteAbout = async (req, res, next) => {
    const { id } = req.body;
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            })
        }
        const aboutData = await About.findByIdAndDelete(id);
        await UserLog.create({
            userId: userId,
            log: `Deleted ${aboutData.title} about content`,
            status: "Deleted",
            role: "admin",
            logo: "/assets/about-page.webp",
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