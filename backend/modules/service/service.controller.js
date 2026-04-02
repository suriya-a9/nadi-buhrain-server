const Service = require('./service.model');
const UserLog = require("../userLogs/userLogs.model");
const UserAccount = require("../userAccount/userAccount.model");
const sendMail = require("../../utils/mailer");
const serviceCreateTemplate = require("../../template/serviceCreateTemplate");

exports.createService = async (req, res, next) => {
    const { name_en, name_ar, points } = req.body;
    try {
        const serviceImage = req.files?.serviceImage?.[0]?.filename;
        const serviceLogo = req.files?.serviceLogo?.[0]?.filename;
        const serviceCreate = await Service.create({
            name_en,
            name_ar,
            points,
            serviceImage,
            serviceLogo
        });

        await UserLog.create({
            userId: req.user.id,
            log: `Created ${serviceCreate.name_en} service to list`,
            status: "Created",
            role: "admin",
            logo: "/assets/service request.webp",
            time: new Date()
        });

        res.status(201).json({
            message: 'Service created'
        });

        try {
            const users = await UserAccount.find({ status: "completed" }, { "basicInfo.email": 1 });

            const emailPromises = users
                .filter(user => user.basicInfo?.email)
                .map(user =>
                    sendMail({
                        to: user.basicInfo.email,
                        subject: "New Service Available",
                        html: serviceCreateTemplate({
                            serviceName: name_en,
                            points: points
                        })
                    }).catch(err => console.error(`Failed to send email to ${user.basicInfo.email}:`, err))
                );

            Promise.all(emailPromises);
        } catch (mailErr) {
            console.error("Failed to send service notification emails:", mailErr);
        }
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
            log: `Updated ${serviceUpdate.name_en} service to list`,
            status: "Updated",
            role: "admin",
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
        const lang = req.query.lang || "en";
        const serviceList = await Service.find({ status: true });
        const data = serviceList.map(item => {
            const obj = item.toObject();
            obj.name = lang === "ar" ? obj.name_ar : obj.name_en;
            delete obj.name_en;
            delete obj.name_ar;
            return obj;
        });
        res.status(200).json({
            data
        })
    } catch (err) {
        next(err)
    }
}

exports.listServiceForAdmin = async (req, res, next) => {
    try {
        const serviceList = await Service.find();
        res.status(200).json({
            success: true,
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
            log: `Deleted ${serviceDelete.name_en} service to list`,
            status: "Deleted",
            role: "admin",
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

exports.statusToggle = async (req, res, next) => {
    const { serviceId, status } = req.body;
    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "service not found"
            })
        }

        service.status = status;
        await service.save();
        await UserLog.create({
            userId: req.user.id,
            log: `${service.name_en} service status updated`,
            status: "Updated",
            role: "admin",
            logo: "/assets/service request.webp",
            time: new Date()
        })
        res.status(200).json({
            success: true,
            message: "Service status updated"
        })
    } catch (err) {
        next(err)
    }
}