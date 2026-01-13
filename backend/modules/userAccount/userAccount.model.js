const mongoose = require('mongoose');

const userAccountSchema = new mongoose.Schema({
    accountTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    fcmToken: {
        type: String,
        default: null
    },
    step: {
        type: Number,
        default: 1
    },
    basicInfo: {
        fullName: {
            type: String,
        },
        mobileNumber: {
            type: Number
        },
        email: {
            type: String
        },
        gender: {
            type: String,
            enum: ["male", "female", "others"],
            default: "male"
        },
        password: {
            type: String,
        }
    },
    isVerfied: {
        type: Boolean,
        default: false
    },
    idProofUrl: {
        type: [String]
    },
    familyCount: {
        type: Number,
        default: 0
    },
    familyMembersAdded: {
        type: Number,
        default: 0
    },
    termsVerfied: {
        type: Boolean,
        default: false
    },
    singnUpCompleted: {
        type: Boolean,
        default: false
    },
    accountVerification: {
        type: String,
        default: "not verified"
    },
    points: {
        type: Number
    },
    status: {
        type: String,
        enum: ["draft", "pending_otp", "completed"],
        default: "draft"
    },
    reason: {
        type: String,
        default: null
    },
    isFamilyMember: {
        type: Boolean,
        default: false
    },
    familyOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount",
        default: null
    },
    familyMemberRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FamilyMember",
        default: null
    },
    accountStatus: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });
userAccountSchema.index({ "basicInfo.mobileNumber": 1 }, { unique: true, sparse: true });
userAccountSchema.index({ "basicInfo.email": 1 }, { unique: true, sparse: true });

const UserAccount = mongoose.model("UserAccount", userAccountSchema);
module.exports = UserAccount;