const { listLogs, viewLogDetails, listAllUserLogs } = require("./userLogs.Controller");
const auth = require('../../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

router.post("/", auth, listLogs);
router.get("/all", listAllUserLogs);
router.post("/detail", auth, viewLogDetails);

module.exports = router;