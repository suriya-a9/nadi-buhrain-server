const Role = require("./role.model");
const UserLog = require('../userLogs/userLogs.model')

exports.addRole = async (req, res, next) => {
    const { name } = req.body;
    try {
        if (!req.user.id) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        await Role.create({
            name
        });
        await UserLog.create({
            userId: req.user.id,
            log: "Role created",
            status: "New Role",
            logo: "/assets/role.webp",
            time: new Date()
        })
        res.status(201).json({
            success: true,
            message: "role created"
        })
    } catch (err) {
        next(err)
    }
}

exports.listRoles = async (req, res, next) => {
    try {
        const roleList = await Role.find();
        res.status(200).json({
            success: true,
            data: roleList
        })
    } catch (err) {
        next(err)
    }
}

exports.updateRole = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!req.user.id) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        const updateData = await Role.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        )
        await UserLog.create({
            userId: req.user.id,
            log: `${updateData.name} role updated`,
            status: "Updated",
            logo: "/assets/role.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "role updated",
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteRole = async (req, res, next) => {
    const { id } = req.body;
    try {
        if (!req.user.id) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        };
        const deleteData = await Role.findByIdAndDelete(
            id,
        );
        await UserLog.create({
            userId: req.user.id,
            log: `${deleteData.name} role deleted`,
            status: "Deleted",
            logo: "/assets/role.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "role deleted",
        })
    } catch (err) {
        next(err)
    }
}