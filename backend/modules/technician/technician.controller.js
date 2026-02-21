const Technician = require('../adminPanel/technician/technician.model');
const Notification = require('../adminPanel/notification/notification.model');
const Inventory = require('../adminPanel/inventory/inventory.model');
const UserService = require('../user/userService/userService.model');
const Address = require('../address/address.model');
const TechnicianUserService = require('../adminPanel/userService/technicianUserService.model');
const SpareParts = require("../adminPanel/spareParts/spareParts.model");
const UserAccount = require('../userAccount/userAccount.model');
const UserLog = require("../userLogs/userLogs.model");
const mongoose = require('mongoose');
const sendPushNotification = require("../../utils/sendPush");
const UserNotification = require("../adminPanel/notification/userNotification.model");
const TechNotification = require("../adminPanel/notification/techNotification.model");
const UserApproval = require("./userApproval.model");

exports.assignedServices = async (req, res, next) => {
    try {
        const technicianId = req.user.id;
        if (!technicianId) {
            return res.status(400).json({ message: "Technician ID required" });
        }

        const techUserServices = await TechnicianUserService.find({
            "assignments": {
                $elemMatch: {
                    technicianId,
                    status: 'pending'
                }
            }
        });

        if (!techUserServices.length) {
            return res.status(200).json({
                message: "no requests yet",
                data: []
            });
        }

        const userServiceIds = techUserServices.map(tus => tus.userServiceId);

        const services = await UserService.find({ _id: { $in: userServiceIds } })
            .populate({
                path: 'userId',
                select: 'basicInfo'
            })
            .populate('serviceId')
            .populate('issuesId');

        const userIds = services.map(s => s.userId._id);
        const addresses = await Address.find({ userId: { $in: userIds } });

        const servicesWithAddress = services.map(service => {
            const address = addresses.find(a => a.userId.toString() === service.userId._id.toString());
            const techUserService = techUserServices.find(tus => tus.userServiceId.toString() === service._id.toString());
            const assignment = techUserService.assignments.find(a => a.technicianId.toString() === technicianId);
            return {
                ...service.toObject(),
                address: address || null,
                assignmentStatus: assignment?.status,
                assignmentReason: assignment?.reason || null
            };
        });

        res.status(200).json({
            data: servicesWithAddress
        });
    } catch (err) {
        next(err);
    }
}

exports.servicesList = async (req, res, next) => {
    try {
        const technicianId = req.user.id;
        const { status = 'all' } = req.query;

        if (!technicianId) {
            return res.status(400).json({ message: "Technician ID required" });
        }

        const techUserServices = await TechnicianUserService.find({
            "assignments.technicianId": technicianId
        });

        if (!techUserServices.length) {
            return res.status(200).json({
                message: "no requests yet",
                data: []
            });
        }

        const userServiceIds = techUserServices.map(tus => tus.userServiceId);

        const services = await UserService.find({ _id: { $in: userServiceIds } })
            .populate({
                path: 'userId',
                select: 'basicInfo'
            })
            .populate('serviceId')
            .populate('issuesId');

        const userIds = services.map(s => s.userId._id);
        const addresses = await Address.find({ userId: { $in: userIds } });

        const servicesWithAddress = services
            .map(service => {
                const address = addresses.find(
                    a => a.userId.toString() === service.userId._id.toString()
                );

                const techUserService = techUserServices.find(
                    tus => tus.userServiceId.toString() === service._id.toString()
                );

                const assignment = techUserService.assignments.find(
                    a => a.technicianId.toString() === technicianId
                );

                return {
                    ...service.toObject(),
                    address: address || null,
                    assignmentStatus: assignment?.status,
                    assignmentReason: assignment?.reason || null,
                    assignmentCreatedAt: assignment?.createdAt || null,
                    technicianUserService: techUserService
                        ? {
                            ...techUserService.toObject(),
                            assignments: techUserService.assignments.filter(
                                a => a.technicianId.toString() === technicianId
                            )
                        }
                        : null
                };
            })
            .filter(service => {
                if (status === 'all') return true;
                if (status === 'in-progress') {
                    return service.assignmentStatus === 'in-progress' || service.assignmentStatus === 'on-hold';
                }
                return service.assignmentStatus === status;
            })
            .sort((a, b) => {
                const dateA = a.assignmentCreatedAt ? new Date(a.assignmentCreatedAt) : new Date(0);
                const dateB = b.assignmentCreatedAt ? new Date(b.assignmentCreatedAt) : new Date(0);
                return dateB - dateA;
            });

        res.status(200).json({
            count: servicesWithAddress.length,
            data: servicesWithAddress
        });

    } catch (err) {
        next(err);
    }
};

// single and bulk material request apis in adminpanel materail request folder for technician - don't forget that bullshit

exports.inventory = async (req, res, next) => {
    try {
        if (!req.user.id) {
            return res.status(404).json({
                message: "user id required"
            })
        }
        const lang = req.query.lang || "en"
        const inventoryList = await SpareParts.find({
            technicianId: req.user.id
        }).populate("productId").sort({ createdAt: -1 });
        if (!inventoryList || inventoryList.length === 0) {
            return res.status(200).json({
                message: "no products in inventory"
            });
        }
        const data = inventoryList.map(item => {
            const obj = item.toObject();
            if (obj.productId) {
                obj.productId.productName = lang === "ar"
                    ? obj.productId.productName_ar
                    : obj.productId.productName_en;
                delete obj.productId.productName_en;
                delete obj.productId.productName_ar;
            }
            if (obj.productName) delete obj.productName;
            return obj;
        });

        res.status(200).json({
            message: "inventory list retrieved",
            data
        });
    } catch (err) {
        next(err);
    }
}

exports.startWork = async (req, res, next) => {
    try {
        const { userServiceId } = req.body;
        const technicianId = req.user.id;

        if (!technicianId) {
            return res.status(404).json({ message: "Technician id not found" });
        }

        if (!userServiceId) {
            return res.status(400).json({ message: "userServiceId is required" });
        }

        const technician = await Technician.findById(technicianId);
        if (!technician) {
            return res.status(404).json({ message: "Technician not found" });
        }

        const userService = await UserService.findById(userServiceId);
        if (!userService) {
            return res.status(404).json({ message: "User service not found" });
        }

        const techUserService = await TechnicianUserService.findOne({
            userServiceId,
            "assignments.technicianId": technicianId
        });

        if (!techUserService) {
            return res.status(404).json({ message: "Technician assignment not found" });
        }

        const assignment = techUserService.assignments.find(
            a => a.technicianId.toString() === technicianId.toString()
        );

        const existingWork = await TechnicianUserService.findOne({
            "assignments.technicianId": technicianId,
            "assignments.status": "in-progress"
        })
        if (existingWork) {
            return res.status(400).json({
                success: false,
                message: "Another work is already in progress"
            })
        }

        if (!assignment?.userApproval) {
            const existingApproval = await UserApproval.findOne({
                userId: userService.userId,
                userServiceId,
                techniciainId: technicianId,
                status: false
            });

            if (!existingApproval) {
                await UserApproval.create({
                    userId: userService.userId,
                    userServiceId,
                    techniciainId: technicianId,
                    status: false
                });
            }

            return res.status(403).json({
                message: "Get user approval before starting work"
            });
        }

        const now = new Date();

        await UserService.findByIdAndUpdate(
            userServiceId,
            {
                serviceStatus: "inProgress",
                "statusTimestamps.inProgress": now,
                workStartedAt: now
            }
        );

        await TechnicianUserService.findOneAndUpdate(
            {
                userServiceId,
                "assignments.technicianId": technicianId
            },
            {
                $set: {
                    "assignments.$.status": "in-progress",
                    "assignments.$.statusChangedAt": now,
                    "assignments.$.workStartedAt": now
                }
            }
        );

        const user = await UserAccount.findById(userService.userId);

        if (user.notification) {
            await sendPushNotification(
                user.fcmToken,
                "Work Started",
                `${technician.firstName} has started working on your request`
            );
        }
        const service = await UserService.findById(userServiceId);

        await UserLog.create({
            userId: technicianId,
            log: `Work started for service ${service.serviceRequestID}`,
            status: "Started",
            role: "technician",
            logo: "/assets/technician.webp",
            time: now
        });

        res.status(200).json({
            message: "Work started successfully"
        });

    } catch (err) {
        next(err);
    }
};

exports.onHoldService = async (req, res, next) => {
    const { userServiceId } = req.body;
    try {
        const technicianId = req.user.id;
        if (!technicianId) {
            return res.status(400).json({ message: 'user id not found' });
        }
        if (!userServiceId) {
            return res.status(400).json({ message: 'service id required' });
        }

        const now = new Date();
        const techUserService = await TechnicianUserService.findOne({
            userServiceId,
            "assignments.technicianId": technicianId
        });
        if (!techUserService) {
            return res.status(404).json({ message: "Technician assignment not found" });
        }
        const assignment = techUserService.assignments.find(
            a => a.technicianId.toString() === technicianId
        );
        let elapsed = 0;
        if (assignment && assignment.workStartedAt) {
            elapsed = Math.floor((now - assignment.workStartedAt) / 1000);
        }
        let newWorkDuration = (assignment?.workDuration || 0) + elapsed;

        await TechnicianUserService.findOneAndUpdate(
            { userServiceId, "assignments.technicianId": technicianId },
            {
                $set: {
                    "assignments.$.status": "on-hold",
                    "assignments.$.statusChangedAt": now,
                    "assignments.$.workDuration": newWorkDuration,
                    "assignments.$.workStartedAt": null
                }
            },
            { new: true }
        );
        await UserLog.create({
            userId: technicianId,
            log: `Work ${userServiceId} on hold`,
            status: "On hold",
            role: "technician",
            logo: "/assets/technician.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "service on hold"
        });
    } catch (err) {
        next(err);
    }
}

exports.getServiceTimer = async (req, res, next) => {
    try {
        const { userServiceId } = req.body;
        const technicianId = req.user.id;

        const techUserService = await TechnicianUserService.findOne({
            userServiceId,
            "assignments.technicianId": technicianId
        });

        if (!techUserService) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        const assignment = techUserService.assignments.find(
            a => a.technicianId.toString() === technicianId.toString()
        );

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        const now = new Date();
        let totalDuration = assignment.workDuration || 0;

        let isRunning = false;

        if (assignment.workStartedAt) {
            const elapsed = Math.floor(
                (now - assignment.workStartedAt) / 1000
            );
            totalDuration += elapsed;
            isRunning = true;
        }

        res.status(200).json({
            totalSeconds: totalDuration,
            isRunning,
            status: assignment.status
        });

    } catch (err) {
        next(err);
    }
};

exports.updateServiceStatus = async (req, res, next) => {
    try {
        const { userServiceId, notes } = req.body;
        const technicianId = req.user.id;
        const mediaFiles = req.files ? req.files.map(file => file.filename) : [];

        if (!technicianId) {
            return res.status(404).json({ message: "user id not found" });
        }
        if (!userServiceId) {
            return res.status(400).json({ message: "userServiceId is required" });
        }

        const now = new Date();
        const techUserService = await TechnicianUserService.findOne({ userServiceId });
        if (!techUserService) {
            return res.status(404).json({ message: "Technician assignment not found" });
        }

        const assignment = techUserService.assignments.find(a => a.technicianId.toString() === technicianId);
        if (!assignment) {
            return res.status(404).json({ message: "Technician assignment not found" });
        }

        let newWorkDuration = assignment.workDuration || 0;
        if (assignment.workStartedAt) {
            const elapsed = Math.floor((now - assignment.workStartedAt) / 1000);
            newWorkDuration += elapsed;
        }

        const updateFields = {
            "assignments.$[elem].notes": notes || "",
            "assignments.$[elem].status": "completed",
            "assignments.$[elem].statusChangedAt": now,
            "assignments.$[elem].workDuration": newWorkDuration,
            "assignments.$[elem].workStartedAt": null
        };
        if (mediaFiles.length > 0) {
            updateFields["assignments.$[elem].media"] = mediaFiles;
        }

        const updatedTechUserService = await TechnicianUserService.findOneAndUpdate(
            { userServiceId },
            { $set: updateFields },
            {
                new: true,
                arrayFilters: [{ "elem.technicianId": technicianId }]
            }
        );

        const userService = await UserService.findById(userServiceId);
        const user = await UserAccount.findById(userService.userId);

        await UserLog.create({
            userId: req.user.id,
            log: `Updated status for work ${userService.serviceRequestID}`,
            status: "Updated",
            role: "technician",
            logo: "/assets/technician.webp",
            time: new Date()
        });
        if (user.notification) {
            await sendPushNotification(
                user.fcmToken,
                "Service Update",
                "The technician has finished the work"
            );
        }

        await UserNotification.create({
            message: "Service finished by technician",
            type: "Service",
            userId: user._id,
            time: now
        });
        res.status(200).json({
            message: "Service completed, notes and media saved",
            techUserService: updatedTechUserService
        });
    } catch (err) {
        next(err);
    }
}

exports.paymentRaise = async (req, res, next) => {
    try {
        const { userServiceId, sparePartsUsed, selectedSpareParts } = req.body;
        const technicianId = req.user.id;

        if (!technicianId) {
            return res.status(404).json({ message: "Technician id not found" });
        }
        if (!userServiceId) {
            return res.status(400).json({ message: "userServiceId is required" });
        }
        const technician = await Technician.findById(technicianId);
        let totalSparePartsCost = 0;
        let usedPartsDetails = [];

        if (sparePartsUsed) {
            if (!Array.isArray(selectedSpareParts) || selectedSpareParts.length === 0) {
                return res.status(400).json({ message: "selectedSpareParts required when sparePartsUsed is true" });
            }
            const productIds = selectedSpareParts.map(p => new mongoose.Types.ObjectId(p.productId));
            const spareParts = await SpareParts.find({
                technicianId: new mongoose.Types.ObjectId(technicianId),
                productId: { $in: productIds }
            });
            const inventoryProducts = await Inventory.find({
                _id: { $in: productIds }
            });

            for (const selected of selectedSpareParts) {
                const part = spareParts.find(sp => sp.productId.toString() === selected.productId);
                const inventory = inventoryProducts.find(inv => inv._id.toString() === selected.productId);
                const usedCount = parseInt(selected.count, 10) || 0;
                if (!part) {
                    return res.status(400).json({ message: `Spare part not found for product ${selected.productId}` });
                }
                const availableCount = parseInt(part.count, 10) || 0;
                if (usedCount > availableCount) {
                    return res.status(400).json({ message: `Not enough stock for product ${inventory?.productName || selected.productId}` });
                }
                part.count = (availableCount - usedCount).toString();
                await part.save();

                const price = inventory?.price || 0;
                totalSparePartsCost += usedCount * price;
                usedPartsDetails.push({
                    productId: selected.productId,
                    productName: inventory?.productName || "",
                    count: usedCount,
                    price,
                    total: usedCount * price
                });
            }
        }

        const updatedTechUserService = await TechnicianUserService.findOneAndUpdate(
            { userServiceId },
            {
                $set: {
                    "assignments.$[elem].usedParts": usedPartsDetails,
                    "assignments.$[elem].status": "completed",
                    "assignments.$[elem].paymentRaised": true
                }
            },
            {
                new: true,
                arrayFilters: [{ "elem.technicianId": new mongoose.Types.ObjectId(technicianId) }]
            }
        );

        const totalPayment = updatedTechUserService.assignments.reduce((sum, assignment) => {
            if (Array.isArray(assignment.usedParts) && assignment.usedParts.length > 0) {
                return sum + assignment.usedParts.reduce((a, p) => a + (p.total || 0), 0);
            }
            return sum;
        }, 0);

        const allPaymentRaised = updatedTechUserService.assignments.every(a => a.paymentRaised === true);

        let userService;
        if (allPaymentRaised) {
            userService = await UserService.findByIdAndUpdate(
                userServiceId,
                {
                    serviceStatus: "paymentInProgress",
                    "statusTimestamps.paymentInProgress": new Date(),
                    payment: totalPayment
                },
                { new: true }
            );
        } else {
            userService = await UserService.findById(userServiceId);
        }

        const notificationMsg = sparePartsUsed
            ? `Payment raised for service ${userService.serviceRequestID}. Spare parts used: ${usedPartsDetails.map(p => `${p.productName} x${p.count}`).join(', ')}. Total: ₹${totalSparePartsCost}`
            : `Payment raised for service ${userService.serviceRequestID}. No spare parts used.`;

        await Notification.create({
            message: notificationMsg,
            type: "payment_raised",
            time: new Date(),
            userId: req.user.id,
            read: false,
            permissions: ['services']
        });
        const service = UserService.findById(userServiceId);
        await UserLog.create({
            userId: req.user.id,
            log: `${technician.firstName} ${technician.lastName} - completed work`,
            status: "Updated",
            role: "technician",
            logo: "/assets/technician.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "Payment raised, notifications sent",
            totalSparePartsCost,
            usedPartsDetails
        });
    } catch (err) {
        next(err);
    }
};

exports.listNotification = async (req, res, next) => {
    try {
        const technicianId = req.user.id;
        if (!technicianId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        const technicianNotificationLists = await TechNotification.find({ userId: technicianId }).sort({ time: -1 });
        res.status(200).json({
            success: true,
            data: technicianNotificationLists
        })
    } catch (err) {
        next(err)
    }
}