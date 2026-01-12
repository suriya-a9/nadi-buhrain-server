const mongoose = require("mongoose");

const userLogsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    log: {
        type: String
    },
    time: {
        type: Date
    },
    status: {
        type: String
    },
    logo: {
        type: String
    }
}, { timestamps: true });

const UserLogs = mongoose.model("UserLogs", userLogsSchema);
module.exports = UserLogs;