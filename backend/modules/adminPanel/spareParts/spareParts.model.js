const mongoose = require('mongoose');

const sparePartsSchema = mongoose.Schema({
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technician"
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory"
    },
    count: {
        type: String
    },
}, { timestamps: true });

const SpareParts = mongoose.model("SpareParts", sparePartsSchema);
module.exports = SpareParts;