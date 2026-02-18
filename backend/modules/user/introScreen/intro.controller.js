const Intro = require('./intro.model');
const UserLog = require("../../userLogs/userLogs.model");

exports.addIntro = async (req, res, next) => {
    try {
        const { content_en, content_ar, status } = req.body;
        if (!content_en || !Array.isArray(content_en)) {
            return res.status(400).json({ message: "content_en must be an array of strings" });
        }

        const intro = await Intro.create({ content_en, content_ar, status });
        await UserLog.create({
            userId: req.user.id,
            log: "Intro content added",
            status: "Created",
            role: "admin",
            logo: "/assets/intro.webp",
            time: new Date()
        });
        res.status(201).json({
            message: "Intro content added successfully",
            data: intro
        });

    } catch (err) {
        next(err);
    }
};

// exports.getIntro = async (req, res, next) => {
//     try {
//         const intro = await Intro.findOne({ status: true });

//         if (!intro) {
//             return res.status(404).json({ message: "Intro not found" });
//         }

//         const { status, ...introObj } = intro.toObject();

//         res.status(200).json({
//             data: introObj
//         });
//     } catch (err) {
//         next(err);
//     }
// };

exports.getIntro = async (req, res, next) => {
    try {
        const lang = req.query.lang || "en";
        const intro = await Intro.findOne({ status: true });

        if (!intro) {
            return res.status(404).json({ message: "Intro not found" });
        }

        const introObj = intro.toObject();
        introObj.content = lang === "ar" ? introObj.content_ar : introObj.content_en;
        delete introObj.content_en;
        delete introObj.content_ar;
        delete introObj.status;

        res.status(200).json({
            data: introObj
        });
    } catch (err) {
        next(err);
    }
};

exports.updateIntro = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        const updateData = await Intro.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );
        await UserLog.create({
            userId: req.user.id,
            log: "Intro content updated",
            status: "Updated",
            role: "admin",
            logo: "/assets/intro.webp",
            time: new Date()
        });
        res.status(200).json({
            message: 'updated',
            data: updateData
        })
    } catch (err) {
        next(err);
    }
}

exports.deleteIntro = async (req, res, next) => {
    const { id } = req.body;
    try {
        await Intro.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: "Intro content Deleted",
            status: "Deleted",
            role: "admin",
            logo: "/assets/intro.webp",
            time: new Date()
        });
        res.status(200).json({
            message: 'Intro deleted successfully'
        })
    } catch (err) {
        next(err);
    }
}

exports.listIntro = async (req, res, next) => {
    try {
        const intro = await Intro.find();

        if (!intro) {
            return res.status(404).json({ message: "Intro not found" });
        }

        res.status(200).json({
            data: intro
        });
    } catch (err) {
        next(err)
    }
}

exports.setIntroStatus = async (req, res, next) => {
    const { id, status } = req.body;
    try {
        const intro = await Intro.findByIdAndUpdate(id, { status }, { new: true });
        if (!intro) {
            return res.status(404).json({ message: "Intro not found" });
        }
        res.status(200).json({
            message: "Intro status updated",
            data: intro
        });
    } catch (err) {
        next(err);
    }
};