const Technician = require("../technician/technician.model");
const SpareParts = require("./spareParts.model");
const TechnicianUserService = require("../userService/technicianUserService.model");
const UserService = require("../../user/userService/userService.model");
const Inventory = require("../inventory/inventory.model");

exports.listTechniciansSparePartsUsage = async (req, res, next) => {
    try {
        const technicians = await Technician.find({}, "firstName lastName email");

        const allSpareParts = await SpareParts.find().populate("productId", "productName");

        const allTechUserServices = await TechnicianUserService.find().populate("userServiceId", "serviceRequestID");

        const sparePartsByTechnician = {};
        allSpareParts.forEach(sp => {
            const techId = sp.technicianId.toString();
            if (!sparePartsByTechnician[techId]) sparePartsByTechnician[techId] = [];
            sparePartsByTechnician[techId].push(sp);
        });

        const result = [];

        for (const tech of technicians) {
            const techId = tech._id.toString();
            const spareParts = sparePartsByTechnician[techId] || [];

            const sparePartsUsage = [];

            for (const sp of spareParts) {
                const usages = [];
                for (const tus of allTechUserServices) {
                    for (const assignment of tus.assignments) {
                        if (assignment.technicianId && assignment.technicianId.toString() === techId) {
                            if (Array.isArray(assignment.usedParts)) {
                                for (const used of assignment.usedParts) {
                                    if (used.productId && used.productId.toString() === sp.productId._id.toString()) {
                                        usages.push({
                                            userService: tus.userServiceId,
                                            count: used.count
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                sparePartsUsage.push({
                    product: sp.productId,
                    usage: usages
                });
            }

            result.push({
                technician: tech,
                spareParts: sparePartsUsage
            });
        }

        res.status(200).json({ data: result });
    } catch (err) {
        next(err);
    }
};