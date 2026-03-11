const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    mobileNumber: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;