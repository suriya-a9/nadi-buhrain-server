const mongoose = require('mongoose');

const materialRequestSchema = new mongoose.Schema({
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technician"
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory"
    },
    quantity: {
        type: String
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ["requested", "processed", "rejected"],
        default: "requested"
    }
}, { timestamps: true });

const MaterialRequest = mongoose.model("MaterialRequest", materialRequestSchema);
module.exports = MaterialRequest;