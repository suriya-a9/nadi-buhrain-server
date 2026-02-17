const mongoose = require("mongoose");
const AccountDeleteReason = require("../accountDeleteReasons/accountDeleteReasons.model");
const UserAccount = require("../../userAccount/userAccount.model");

const deletedAccountSchema = new mongoose.Schema({
    reasonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AccountDeleteReason
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    role: {
        type: String
    }
}, { timestamps: true });

const DeletedAccounts = mongoose.model("DeletedAccounts", deletedAccountSchema);

module.exports = DeletedAccounts;