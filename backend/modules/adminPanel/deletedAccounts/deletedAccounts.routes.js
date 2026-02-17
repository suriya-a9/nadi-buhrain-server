const express = require("express");
const DeletedAccounts = require("./deletedAccounts.model");

const router = express.Router();

router.get("/", async (req, res) => {
    const deletedAccounts = await DeletedAccounts.find().populate("reasonId").sort({ time: -1 });
    res.json({ data: deletedAccounts });
})

module.exports = router;