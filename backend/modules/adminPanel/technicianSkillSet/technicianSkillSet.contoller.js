const TechnicalSkillSet = require('./technicianSkillSet.model');
const UserLog = require("../../userLogs/userLogs.model");

exports.addSkillSet = async (req, res, next) => {
    const { skill } = req.body;
    try {
        const skillsAdd = await TechnicalSkillSet.create({
            skill
        });
        await UserLog.create({
            userId: req.user.id,
            log: `Created skillset - ${skillsAdd.skill}`,
            status: "Created",
            logo: "/assets/technician.webp",
            time: new Date()
        });
        res.status(201).json({
            message: 'created successfully',
            data: skillsAdd
        })
    } catch (err) {
        next(err)
    }
}

exports.listSkillSet = async (req, res, next) => {
    try {
        const skillsList = await TechnicalSkillSet.find();
        res.status(200).json({
            data: skillsList
        })
    } catch (err) {
        next(err);
    }
}

exports.updateSkillSet = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        const skillSetUpdate = await TechnicalSkillSet.findByIdAndUpdate(id, updateFields, { new: true });
        await UserLog.create({
            userId: req.user.id,
            log: `Updated skillset - ${skillSetUpdate.skill}`,
            status: "Updated",
            logo: "/assets/technician.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "updated successfully"
        })
    } catch (err) {
        next(err);
    }
}

exports.deleteSkillSet = async (req, res, next) => {
    const { id } = req.body;
    try {
        const skillSetDelete = await TechnicalSkillSet.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: `Deleted skillset - ${skillSetDelete.skill}`,
            status: "Deleted",
            logo: "/assets/technician.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "deleted successfully"
        })
    } catch (err) {
        next(err);
    }
}