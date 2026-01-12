const Service = require('./service.model');
const UserLog = require("../userLogs/userLogs.model");

exports.createService = async (req, res, next) => {
    const { name } = req.body;
    try {
        const serviceImage = req.files?.serviceImage?.[0]?.filename;
        const serviceLogo = req.files?.serviceLogo?.[0]?.filename;
        const serviceCreate = await Service.create({
            name,
            serviceImage,
            serviceLogo
        });
        await UserLog.create({
            userId: req.user.id,
            log: `Created ${serviceCreate.name} service to list`,
            status: "Created",
            logo: "/assets/service request.webp",
            time: new Date()
        });
        res.status(201).json({
            message: 'Service created'
        })
    } catch (err) {
        next(err);
    }
}

exports.updateService = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        if (req.files?.serviceImage) {
            updateFields.serviceImage = req.files.serviceImage[0].filename;
        }
        if (req.files?.serviceLogo) {
            updateFields.serviceLogo = req.files.serviceLogo[0].filename;
        }
        const serviceUpdate = await Service.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );
        await UserLog.create({
            userId: req.user.id,
            log: `Updated ${serviceUpdate.name} service to list`,
            status: "Updated",
            logo: "/assets/service request.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "Service updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

exports.listService = async (req, res, next) => {
    try {
        const serviceList = await Service.find();
        res.status(200).json({
            data: serviceList
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteService = async (req, res, next) => {
    const { id } = req.body;
    try {
        const serviceDelete = await Service.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: `Deleted ${serviceDelete.name} service to list`,
            status: "Deleted",
            logo: "/assets/service request.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "Deleted successfully"
        })
    } catch (err) {
        next(err)
    }
}