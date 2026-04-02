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
            role: "admin",
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
        const roleList = await Role.find({ status: true });
        res.status(200).json({
            success: true,
            data: roleList
        })
    } catch (err) {
        next(err)
    }
}

exports.adminRoleList = async (req, res, next) => {
    try {
        const listData = await Role.find();
        res.status(200).json({
            success: true,
            data: listData
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
            role: "admin",
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
            role: "admin",
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

exports.statusToggle = async (req, res, next) => {
    const { roleId, status } = req.body;
    try {
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "role not found"
            })
        }

        role.status = status;
        await role.save();
        await UserLog.create({
            userId: req.user.id,
            log: `${role.name} role status updated`,
            status: "Updated",
            role: "admin",
            logo: "/assets/role.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "Role status updated"
        })
    } catch (err) {
        next(err)
    }
}