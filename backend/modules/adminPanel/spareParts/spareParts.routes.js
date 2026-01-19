const { listSpareParts } = require("./spareParts.controller");
const auth = require("../../../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

router.post("/", auth, listSpareParts);

module.exports = router;