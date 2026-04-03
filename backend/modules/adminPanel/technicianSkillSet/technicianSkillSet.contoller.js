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
            role: "admin",
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
        const skillsList = await TechnicalSkillSet.find({ status: true });
        res.status(200).json({
            data: skillsList
        })
    } catch (err) {
        next(err);
    }
}

exports.adminList = async (req, res, next) => {
    try {
        const listData = await TechnicalSkillSet.find();
        res.status(200).json({
            success: true,
            data: listData
        })
    } catch (err) {
        next(err)
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
            role: "admin",
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
            role: "admin",
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

exports.statusToggle = async (req, res, next) => {
    const { skillId, status } = req.body;
    try {
        const skill = await TechnicalSkillSet.findById(skillId);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "skill not found"
            })
        };
        skill.status = status;
        await skill.save();
        await UserLog.create({
            userId: req.user.id,
            log: `Updated skillset - ${skill.skill}`,
            status: "Updated",
            role: "admin",
            logo: "/assets/technician.webp",
            time: new Date()
        });
        res.status(200).json({
            success: true,
            message: 'status updated'
        })
    } catch (err) {
        next(err)
    }
}