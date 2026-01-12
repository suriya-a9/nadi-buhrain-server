const MaterialRequest = require('./materialRequest.model');
const Inventory = require("../inventory/inventory.model");
const SpareParts = require("../spareParts/spareParts.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.singleRequest = async (req, res, next) => {
    const { productId, quantity, notes } = req.body;
    try {
        if (!req.user.id) {
            return res.status(400).json({
                message: "user id needed"
            });
        }
        const product = await Inventory.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "no such product"
            });
        }
        if (product.stock === false) {
            return res.status(404).json({
                message: "product currently out of stock"
            });
        }
        const availableQty = parseInt(product.quantity, 10);
        const requestedQty = parseInt(quantity, 10);
        if (isNaN(availableQty) || isNaN(requestedQty)) {
            return res.status(400).json({
                message: "Invalid quantity value"
            });
        }
        if (requestedQty > availableQty) {
            return res.status(400).json({
                message: "Not enough stocks"
            });
        }
        await MaterialRequest.create({
            technicianId: req.user.id,
            productId: product._id,
            quantity,
            notes
        });
        await UserLog.create({
            userId: req.user.id,
            log: `Requested for ${product.productName}`,
            status: "Requested",
            logo: "/assets/product-management.webp",
            time: new Date()
        });
        res.status(201).json({
            message: "Material request created successfully"
        });
    } catch (err) {
        next(err);
    }
}

exports.bulkRequest = async (req, res, next) => {
    try {
        const { requests } = req.body;

        if (!req.user.id) {
            return res.status(400).json({ message: "user id needed" });
        }

        if (!Array.isArray(requests) || requests.length === 0) {
            return res.status(400).json({ message: "No requests provided" });
        }

        for (const reqItem of requests) {
            const { productId, quantity } = reqItem;

            const product = await Inventory.findById(productId);
            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${productId}`
                });
            }
            if (product.stock === false) {
                return res.status(404).json({
                    message: "product currently out of stock"
                });
            }
            const availableQty = parseInt(product.quantity, 10);
            const requestedQty = parseInt(quantity, 10);

            if (isNaN(availableQty) || isNaN(requestedQty)) {
                return res.status(400).json({
                    message: `Invalid quantity for product: ${productId}`
                });
            }

            if (requestedQty > availableQty) {
                return res.status(400).json({
                    message: `Requested quantity exceeds stock for product: ${productId}`
                });
            }
        }

        const bulkData = requests.map(item => ({
            technicianId: req.user.id,
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes || ""
        }));

        await MaterialRequest.insertMany(bulkData);
        await UserLog.create({
            userId: req.user.id,
            log: `Bulk requested for products`,
            status: "Requested",
            logo: "/assets/product-management.webp",
            time: new Date()
        });
        res.status(201).json({
            message: "Bulk material requests submitted successfully",
            totalRequests: requests.length
        });

    } catch (err) {
        next(err);
    }
};

exports.responseMaterialRequest = async (req, res, next) => {
    const { id, status } = req.body;
    try {
        const request = await MaterialRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Material request not found" });
        }

        if (status === "processed") {
            request.status = "processed";
            await request.save();

            const inventory = await Inventory.findById(request.productId);
            if (!inventory) {
                return res.status(404).json({ message: "Inventory product not found" });
            }
            const availableQty = parseInt(inventory.quantity, 10);
            const reqQty = parseInt(request.quantity, 10);
            if (availableQty < reqQty) {
                return res.status(400).json({ message: "Not enough stock in inventory" });
            }
            inventory.quantity = (availableQty - reqQty).toString();
            await inventory.save();

            let spare = await SpareParts.findOne({
                technicianId: request.technicianId,
                productId: request.productId
            });
            if (spare) {
                const currentCount = parseInt(spare.count, 10) || 0;
                spare.count = (currentCount + reqQty).toString();
                await spare.save();
            } else {
                await SpareParts.create({
                    technicianId: request.technicianId,
                    productId: request.productId,
                    count: reqQty.toString()
                });
            }
            await UserLog.create({
                userId: req.user.id,
                log: `Processed material request for ${inventory.productName}`,
                status: "Requested",
                logo: "/assets/product-management.webp",
                time: new Date()
            });
            return res.status(200).json({
                message: "Request processed, inventory and spare parts updated",
                data: request
            });
        } else {
            request.status = status;
            await request.save();
            return res.status(200).json({
                message: "Request status updated",
                data: request
            });
        }
    } catch (err) {
        next(err);
    }
};

exports.productTechnicians = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const requests = await MaterialRequest.find({ productId })
            .populate('technicianId', 'firstName lastName email');
        const data = requests.map(r => ({
            _id: r._id,
            technician: r.technicianId,
            quantity: r.quantity,
            status: r.status
        }));
        res.json({ data });
    } catch (err) {
        next(err);
    }
};

exports.listMaterialRequests = async (req, res, next) => {
    try {
        const listData = await MaterialRequest.find()
            .populate("technicianId")
            .populate("productId");
        res.status(200).json({
            success: true,
            data: listData
        })
    } catch (err) {
        next(err)
    }
}

exports.listSpareParts = async (req, res, next) => {
    try {
        const listData = await SpareParts.find()
            .populate("technicianId")
            .populate("productId");
        res.status(200).json({
            success: true,
            data: listData
        })
    } catch (err) {
        next(err)
    }
}