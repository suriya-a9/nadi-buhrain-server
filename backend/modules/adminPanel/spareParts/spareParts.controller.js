const SpareParts = require("./spareParts.model");

exports.listSpareParts = async (req, res, next) => {
    try {
        const technicianId = req.user?.id;

        if (!technicianId) {
            return res.status(401).json({
                success: false,
                message: "Technician ID required"
            });
        }

        const sparePartsData = await SpareParts
            .find({ technicianId })
            .populate("productId").sort({createdAt: -1});

        res.status(200).json({
            success: true,
            data: sparePartsData
        });
    } catch (err) {
        next(err);
    }
};