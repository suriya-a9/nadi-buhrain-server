const UserService = require('../../user/userService/userService.model');
const TechnicianUserService = require('./technicianUserService.model');
const formatDate = require('../../../utils/formatDate');
const UserLog = require("../../userLogs/userLogs.model");
const Technician = require("../technician/technician.model")
const Notification = require("../notification/notification.model");
const Admin = require("../../admin/admin.model");
const UserAccount = require("../../userAccount/userAccount.model");
const sendPushNotification = require("../../../utils/sendPush");

exports.newUserServiceRequest = async (req, res, next) => {
    try {
        const newServiceList = await UserService.find({ serviceStatus: "submitted" })
            .populate("userId")
            .populate('serviceId')
            .populate('issuesId');
        const formattedList = newServiceList.map(service => {
            const formattedTimestamps = {};
            Object.entries(service.statusTimestamps).forEach(([key, value]) => {
                formattedTimestamps[key] = formatDate(value, true);
            });
            return {
                ...service.toObject(),
                statusTimestamps: formattedTimestamps,
                scheduleService: formatDate(service.scheduleService, true),
                createdAt: formatDate(service.createdAt, true),
                updatedAt: formatDate(service.updatedAt, true)
            };
        });
        res.status(200).json({
            data: formattedList
        })
    } catch (err) {
        next(err);
    }
}

exports.updateServiceStatus = async (req, res, next) => {
    const { id, serviceStatus, reason } = req.body;
    try {
        const validStatuses = [
            "submitted",
            "accepted",
            "technicianAssigned",
            "inProgress",
            "paymentInProgress",
            "completed",
            "rejected"
        ];
        if (!validStatuses.includes(serviceStatus)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const adminUser = await Admin.findById(req.user.id)
        const userService = await UserService.findById(id);
        if (!userService) {
            return res.status(404).json({ message: "Service not found" });
        }
        const userId = userService.userId;
        const user = await UserAccount.findById(userId)
        if (serviceStatus === "paymentInProgress") {
            const assignments = await TechnicianUserService.find({ userServiceId: id });
            if (!assignments.length) {
                return res.status(400).json({ message: "No technicians assigned" });
            }
            const allCompleted = assignments.every(a => a.status === "completed");
            if (!allCompleted) {
                return res.status(400).json({ message: "All technicians must complete their work before payment" });
            }
            const anySparePartsUsed = assignments.some(a => Array.isArray(a.usedParts) && a.usedParts.length > 0);
            if (!anySparePartsUsed) {
                return res.status(400).json({ message: "No spare parts used by any technician" });
            }
        }

        const update = {
            serviceStatus,
            acceptedBy: adminUser.name,
            [`statusTimestamps.${serviceStatus}`]: new Date()
        };

        if (serviceStatus === "rejected") {
            if (!reason) {
                return res.status(400).json({ message: "Reason required for rejection" });
            }
            update.reason = reason;
        }

        const updated = await UserService.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true }
        );
        await UserLog.create({
            userId: req.user.id,
            log: `Service request ${updated._id} updated to status: ${serviceStatus}`,
            status: "Updated",
            logo: "/assets/service request.webp",
            time: new Date()
        });
        await sendPushNotification(
            user.fcmToken,
            "Service Request",
            `Service request ${serviceStatus}`
        );
        res.status(200).json({
            message: "Status updated",
            data: updated
        });
    } catch (err) {
        console.log("Service error", err)
        next(err);
    }
};

exports.assignTechnician = async (req, res, next) => {
    const { serviceId, technicianIds } = req.body;
    try {
        if (!serviceId || !Array.isArray(technicianIds) || technicianIds.length === 0) {
            return res.status(400).json({ message: "serviceId and technicianIds are required" });
        }
        const now = new Date();
        const assignments = technicianIds.map(technicianId => ({
            technicianId,
            status: 'pending',
            statusChangedAt: now,
            notes: "",
            media: [],
            usedParts: []
        }));

        const techUserService = await TechnicianUserService.findOneAndUpdate(
            { userServiceId: serviceId },
            { $push: { assignments: { $each: assignments } } },
            { upsert: true, new: true }
        );

        await UserService.findByIdAndUpdate(
            serviceId,
            { $addToSet: { technicianIds: { $each: technicianIds } } }
        );

        await UserLog.create({
            userId: req.user.id,
            log: `Requested technician for server id ${serviceId}`,
            status: "Requested",
            logo: "/assets/service request.webp",
            time: new Date()
        });

        res.status(200).json({
            message: "Technician assignments created",
            data: techUserService
        });
    } catch (err) {
        next(err);
    }
}
exports.removeTechnicianAssignment = async (req, res, next) => {
    try {
        const { serviceId, technicianId } = req.body;
        if (!serviceId || !technicianId) {
            return res.status(400).json({ message: "serviceId and technicianId are required" });
        }

        const techUserService = await require('./technicianUserService.model').findOneAndUpdate(
            { userServiceId: serviceId },
            { $pull: { assignments: { technicianId } } },
            { new: true }
        );

        await require('../../user/userService/userService.model').findByIdAndUpdate(
            serviceId,
            { $pull: { technicianIds: technicianId } }
        );

        await require("../../userLogs/userLogs.model").create({
            userId: req.user.id,
            log: `Removed technician ${technicianId} from service ${serviceId}`,
            status: "Removed",
            logo: "/assets/service request.webp",
            time: new Date()
        });

        res.status(200).json({
            message: "Technician removed from assignment",
            data: techUserService
        });
    } catch (err) {
        next(err);
    }
};
exports.technicianRespond = async (req, res, next) => {
    const { assignmentId, action, reason } = req.body;
    const technicianId = req.user.id;

    try {
        const now = new Date();
        const technician = await Technician.findById(technicianId);
        if (action === 'accept') {

            const assignment = await TechnicianUserService.findOneAndUpdate(
                {
                    userServiceId: assignmentId,
                    "assignments.technicianId": technicianId
                },
                {
                    $set: {
                        "assignments.$.status": "accepted",
                        "assignments.$.statusChangedAt": now
                    }
                },
                { new: true }
            );

            if (!assignment) {
                return res.status(404).json({ message: "Assignment not found" });
            }

            const allAccepted = assignment.assignments.every(
                a => a.status === "accepted" || a.status === "rejected"
            );

            if (allAccepted) {
                await UserService.findByIdAndUpdate(
                    assignmentId,
                    {
                        $set: {
                            serviceStatus: "technicianAssigned",
                            [`statusTimestamps.technicianAssigned`]: now
                        }
                    }
                );
            }

            await UserLog.create({
                userId: technicianId,
                log: 'Accepted a request',
                status: "Accepted",
                logo: "/assets/service request.webp",
                time: now
            });
            const notification = await Notification.create({
                type: 'Accepted',
                message: `${technician.firstName} accepted the request`,
                userId: technicianId,
                time: new Date(),
                read: false
            });
            const io = req.app.get('io');
            io.emit('notification', notification);
            return res.status(200).json({
                message: "Service accepted",
                data: assignment
            });

        } else if (action === 'reject') {

            if (!reason) {
                return res.status(400).json({
                    message: "Reason required for rejection"
                });
            }

            const assignment = await TechnicianUserService.findOneAndUpdate(
                {
                    userServiceId: assignmentId,
                    "assignments.technicianId": technicianId
                },
                {
                    $set: {
                        "assignments.$.status": "rejected",
                        "assignments.$.reason": reason,
                        "assignments.$.statusChangedAt": now
                    }
                },
                { new: true }
            );

            if (!assignment) {
                return res.status(404).json({ message: "Assignment not found" });
            }

            await UserLog.create({
                userId: technicianId,
                log: 'Rejected a request',
                status: "Rejected",
                logo: "/assets/service request.webp",
                time: now
            });
            const notification = await Notification.create({
                type: 'Rejected',
                message: `${technician.firstName} rejected the request`,
                userId: technicianId,
                time: new Date(),
                read: false
            });
            const io = req.app.get('io');
            io.emit('notification', notification);
            return res.status(200).json({
                message: "Service rejected",
                data: assignment
            });

        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

    } catch (err) {
        next(err);
    }
};

exports.acceptedServiceRequests = async (req, res, next) => {
    try {
        const newServiceList = await UserService.find({
            serviceStatus: { $nin: ["submitted", "rejected"] }
        })
            .populate("userId")
            .populate('serviceId')
            .populate('issuesId')
            .populate('technicianId');
        const formattedList = newServiceList.map(service => {
            const formattedTimestamps = {};
            Object.entries(service.statusTimestamps).forEach(([key, value]) => {
                formattedTimestamps[key] = formatDate(value, true);
            });
            return {
                ...service.toObject(),
                statusTimestamps: formattedTimestamps,
                scheduleService: formatDate(service.scheduleService, true),
                createdAt: formatDate(service.createdAt, true),
                updatedAt: formatDate(service.updatedAt, true)
            };
        });
        res.status(200).json({
            data: formattedList
        })
    } catch (err) {
        next(err);
    }
}

exports.getTechnicianWorkStatus = async (req, res, next) => {
    try {
        const { userServiceId } = req.params;
        const record = await TechnicianUserService.findOne({ userServiceId });
        if (!record) return res.status(404).json({ message: "Not found" });
        res.json({
            status: record.status,
            notes: record.notes,
            media: record.media,
            usedParts: record.usedParts,
            workStartedAt: record.workStartedAt,
            workDuration: record.workDuration
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllTechnicianAssignments = async (req, res, next) => {
    try {
        const { userServiceId } = req.params;
        const record = await require('./technicianUserService.model').findOne({ userServiceId })
            .populate('assignments.technicianId', 'firstName lastName email');
        if (!record) return res.status(404).json({ message: "Not found" });
        res.json({
            assignments: record.assignments || []
        });
    } catch (err) {
        next(err);
    }
};