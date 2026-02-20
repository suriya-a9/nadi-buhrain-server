const express = require("express");
const router = express.Router();
const auth = require("../../../middleware/authMiddleware");
const { listTechniciansSparePartsUsage } = require("./sparePartsUsage.controller");
router.get("/all-usage", listTechniciansSparePartsUsage);

module.exports = router;