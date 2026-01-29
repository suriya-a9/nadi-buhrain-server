const mongoose = require("mongoose");

exports.listTransactions = async (req, res, next) => {
    try {
        const RequestWithNames = mongoose.connection.collection("request_with_names");
        const transactions = await RequestWithNames.find({}).sort({ createdAt: -1 }).toArray();

        res.json({ success: true, data: transactions });
    } catch (err) {
        next(err);
    }
}