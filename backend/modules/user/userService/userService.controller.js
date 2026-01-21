const mongoose = require('mongoose')
const UserService = require('./userService.model');
const formatDate = require('../../../utils/formatDate');
const UserAccount = require("../../userAccount/userAccount.model");
const Notification = require('../../../modules/adminPanel/notification/notification.model');
const TechnicianUserService = require('../../adminPanel/userService/technicianUserService.model');
const UserLog = require("../../userLogs/userLogs.model");
const Service = require("../../service/service.model");
const Technician = require("../../adminPanel/technician/technician.model")
const PointsHistory = require("../../adminPanel/points/pointsHistory.model");

exports.createRequest = async (req, res, next) => {
    const { serviceId, issuesId, feedback, scheduleService, immediateAssistance, otherIssue } = req.body;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                message: "user id needed"
            })
        }
        const user = await UserAccount.findById(userId);
        if (user.accountVerification !== "verified") {
            return res.status(400).json({
                message: 'Your account is not verified yet. Kindly wait till your account get verified'
            })
        }
        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: "Invalid serviceId" });
        }
        if (!issuesId && !otherIssue) {
            return res.status(400).json({ message: "Either issuesId or otherIssue is required" });
        }
        if (issuesId && !mongoose.Types.ObjectId.isValid(issuesId)) {
            return res.status(400).json({ message: "Invalid issuesId" });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        const servicePoints = parseInt(service.points || "0", 10);
        const userPoints = parseInt(user.points || "0", 10);

        if (userPoints < servicePoints) {
            return res.status(400).json({ message: "Insufficient points to request this service" });
        }

        const fileNames = req.files ? req.files.map(file => file.filename) : [];

        const requestCreate = await UserService.create({
            userId: userId,
            serviceId,
            issuesId: issuesId ? issuesId : null,
            otherIssue: otherIssue ? otherIssue : null,
            media: fileNames,
            feedback,
            scheduleService: scheduleService ? new Date(scheduleService) : null,
            immediateAssistance: !!immediateAssistance,
            serviceStatus: "submitted",
            statusTimestamps: {
                submitted: new Date(),
                processing: null,
                technicianAssigned: null,
                inProgress: null,
                paymentInProgress: null,
                completed: null
            }
        });

        user.points = userPoints - servicePoints;
        await user.save();

        const notification = await Notification.create({
            type: 'service_request',
            message: `New service request submitted by ${user.basicInfo.fullName}`,
            userId: user._id,
            time: new Date(),
            read: false
        });
        const io = req.app.get('io');
        io.emit('notification', notification);
        await UserLog.create({
            userId: req.user.id,
            log: `New service requested submitted`,
            status: "Submitted",
            logo: "/assets/service request.webp",
            time: new Date()
        });
        await PointsHistory.create({
            userId: req.user.id,
            history: `Deducted ${servicePoints} for service request`,
            points: servicePoints,
            time: new Date(),
            status: "debit"
        });
        res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: requestCreate
        })
    } catch (err) {
        next(err)
    }
}

// exports.userServiceList = async (req, res, next) => {
//     try {
//         const userId = req.user.id;
//         if (!userId) {
//             return res.status(404).json({
//                 message: "user id needed"
//             });
//         }

//         const page = parseInt(req.query.page) || 10;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const totalCount = await UserService.countDocuments({ userId });

//         const userServicesList = await UserService.find({ userId })
//             .populate('serviceId')
//             .populate('issuesId')
//             .populate('technicianId')
//             .skip(skip)
//             .limit(limit);

//         const formattedList = userServicesList.map(service => {
//             const formattedTimestamps = {};
//             Object.entries(service.statusTimestamps || {}).forEach(([key, value]) => {
//                 formattedTimestamps[key] = formatDate(value, true);
//             });
//             return {
//                 ...service.toObject(),
//                 statusTimestamps: formattedTimestamps,
//                 scheduleService: formatDate(service.scheduleService, true),
//                 createdAt: formatDate(service.createdAt, true),
//                 updatedAt: formatDate(service.updatedAt, true)
//             };
//         });

//         res.status(200).json({
//             data: formattedList,
//             pagination: {
//                 totalItems: totalCount,
//                 currentPage: page,
//                 totalPages: Math.ceil(totalCount / limit),
//                 pageSize: limit
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// };
exports.userServiceList = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(404).json({
                message: "user id needed"
            });
        }

        const services = await UserService.find({ userId })
            .populate('serviceId')
            .populate('issuesId');

        const serviceIds = services.map(s => s._id);

        const technicianDocs = await TechnicianUserService.find({
            userServiceId: { $in: serviceIds }
        }).populate('assignments.technicianId');

        const techMap = {};
        technicianDocs.forEach(doc => {
            techMap[doc.userServiceId.toString()] =
                doc.assignments.filter(a => a.status === 'accepted');
        });

        // const formattedList = services.map(service => {
        //     const formattedTimestamps = {};

        //     Object.entries(service.statusTimestamps || {}).forEach(([k, v]) => {
        //         formattedTimestamps[k] = v ? formatDate(v, true) : null;
        //     });

        //     return {
        //         ...service.toObject(),
        //         statusTimestamps: formattedTimestamps,
        //         scheduleService: formatDate(service.scheduleService, true),
        //         createdAt: formatDate(service.createdAt, true),
        //         updatedAt: formatDate(service.updatedAt, true),

        //         acceptedTechnicians:
        //             techMap[service._id.toString()] || []
        //     };
        // });

        const formattedList = services.map(service => {
            return {
                ...service.toObject(),
                acceptedTechnicians: techMap[service._id.toString()] || []
            };
        });

        res.status(200).json({ data: formattedList });

    } catch (err) {
        next(err);
    }
};

exports.ongoingRequest = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            });
        }

        const userService = await UserService.findOne({
            userId,
            serviceStatus: "inProgress"
        });

        if (!userService) {
            return res.status(404).json({
                success: false,
                message: "No in-progress request found"
            });
        }

        const technicianService = await TechnicianUserService.findOne({
            userServiceId: userService._id
        });

        if (!technicianService) {
            return res.status(404).json({
                success: false,
                message: "Technician not assigned"
            });
        }

        const activeAssignment = technicianService.assignments.find(
            a => a.status === "in-progress"
        );

        if (!activeAssignment) {
            return res.status(404).json({
                success: false,
                message: "No technician currently working"
            });
        }

        const technician = await Technician.findById(
            activeAssignment.technicianId
        ).select("firstName lastName");

        return res.status(200).json({
            success: true,
            data: {
                requestId: userService.serviceRequestID,
                status: userService.serviceStatus,
                technicianName: technician
                    ? `${technician.firstName} ${technician.lastName}`
                    : null
            }
        });

    } catch (err) {
        next(err);
    }
};