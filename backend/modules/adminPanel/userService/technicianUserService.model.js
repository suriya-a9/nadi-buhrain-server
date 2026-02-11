const mongoose = require('mongoose');

const technicianAssignmentSchema = new mongoose.Schema({
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technician"
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'on-hold', 'rejected', 'completed'],
        default: 'pending'
    },
    statusChangedAt: {
        type: Date,
        default: Date.now
    },
    reason: String,
    notes: String,
    media: [String],
    workStartedAt: Date,
    userApproval: { type: Boolean, default: false },
    workDuration: { type: Number, default: 0 },
    usedParts: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
            productName: String,
            count: Number,
            price: Number,
            total: Number
        }
    ],
    paymentRaised: { type: Boolean, default: false },
    adminNotified: { type: Boolean, default: false }
}, { timestamps: true });

technicianAssignmentSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusChangedAt = new Date();
    }
    // next();
});

const technicianUserService = new mongoose.Schema({
    userServiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserService"
    },
    assignments: [technicianAssignmentSchema],
    adminNotified: { type: Boolean, default: false }
});

const TechnicianUserService = mongoose.model("TechnicianUserService", technicianUserService);
module.exports = TechnicianUserService;