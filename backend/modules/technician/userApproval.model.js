const mongoose = require("mongoose");
const UserAccount = require("../userAccount/userAccount.model");
const UserService = require("../user/userService/userService.model");
const Technician = require("../adminPanel/technician/technician.model");

const UserApprovalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: UserAccount
    },
    userServiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: UserService
    },
    techniciainId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Technician
    },
    status: {
        type: Boolean,
        default: false
    }
})

const UserApproval = mongoose.model("UserApproval", UserApprovalSchema);
module.exports = UserApproval;