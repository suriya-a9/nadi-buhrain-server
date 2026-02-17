const mongoose = require("mongoose");
const Admin = require("../../admin/admin.model");

const accountDeleteReasonsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Admin
    },
    reason_en: {
        type: String
    },
    reason_ar: {
        type: String
    }
}, { timestamps: true });

const AccountDeleteReason = mongoose.model("AccountDeleteReason", accountDeleteReasonsSchema);
module.exports = AccountDeleteReason;