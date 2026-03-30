const mongoose = require('mongoose');

const userServiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    },
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technician"
    },
    issuesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
        default: null
    },
    otherIssue: {
        type: String,
        default: null
    },
    serviceRequestID: {
        type: String
    },
    media: {
        type: [String]
    },
    voice: {
        type: String
    },
    feedback: {
        type: String
    },
    scheduleService: {
        type: Date,
        default: null
    },
    scheduleServiceTime: {
        type: String,
        default: null
    },
    immediateAssistance: {
        type: Boolean,
        default: false
    },
    acceptedBy: {
        type: String
    },
    completedBy: {
        type: String
    },
    serviceStatus: {
        type: String,
        enum: [
            "submitted",
            "accepted",
            "technicianAssigned",
            "inProgress",
            "paymentInProgress",
            "completed",
            "rejected"
        ],
        default: "submitted"
    },
    reason: {
        type: String,
        default: null
    },
    technicianAccepted: {
        type: Boolean,
        default: false
    },
    statusTimestamps: {
        submitted: { type: Date, default: null },
        accepted: { type: Date, default: null },
        technicianAssigned: { type: Date, default: null },
        inProgress: { type: Date, default: null },
        paymentInProgress: { type: Date, default: null },
        completed: { type: Date, default: null }
    },
    payment: {
        type: Number,
        default: "0"
    }
}, { timestamps: true });

userServiceSchema.pre('save', async function () {
    if (!this.serviceRequestID) {
        const count = await mongoose.model('UserService').countDocuments() + 1;
        this.serviceRequestID = `SRM ${count.toString().padStart(3, '0')}`;
    }
});

const UserService = mongoose.model("UserService", userServiceSchema);
module.exports = UserService;