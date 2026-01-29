const { listTransactions } = require("./pointTransaction.controller");

const express = require("express");

const router = express.Router();

router.get('/', listTransactions);

module.exports = router;