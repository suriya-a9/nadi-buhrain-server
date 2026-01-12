const Intro = require('./intro.model');
const UserLog = require("../../userLogs/userLogs.model");

exports.addIntro = async (req, res, next) => {
    try {
        const { content, status } = req.body;
        if (!content || !Array.isArray(content)) {
            return res.status(400).json({ message: "content must be an array of strings" });
        }
        const intro = await Intro.create({ content, status });
        await UserLog.create({
            userId: req.user.id,
            log: "Intro content added",
            status: "Created",
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

exports.getIntro = async (req, res, next) => {
    try {
        const intro = await Intro.findOne({ status: true });

        if (!intro) {
            return res.status(404).json({ message: "Intro not found" });
        }

        const introObj = intro.toObject();

        introObj.content = introObj.content.map((item, index) => ({
            [index]: item
        }));

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
        await Intro.findByIdAndDelete(id)
        await UserLog.create({
            userId: req.user.id,
            log: "Intro content Deleted",
            status: "Deleted",
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
        const intro = await Intro.find()

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
            return res.status(404).json({ message: "Intro not found" })
        }
        res.status(200).json({
            message: "Intro status updated",
            data: intro
        });
    } catch (err) {
        next(err)
    }
};