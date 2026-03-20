const mongoose = require("mongoose");
const Account = require("../../user/accountType/account.model");
const UserAccount = require("../../userAccount/userAccount.model");

const GiftSchema = new mongoose.Schema({
    title: {
        type: String
    },
    caption: {
        type: String
    },
    totalPoints: {
        type: Number
    },
    status: {
        type: Boolean,
        default: false
    },
    allowedAccountTypes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    }],
    targetUserIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    }]
}, { timestamps: true });

const Gift = mongoose.model("Gift", GiftSchema);
module.exports = Gift;