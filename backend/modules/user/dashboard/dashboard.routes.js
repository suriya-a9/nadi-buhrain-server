const { userDashboardDetails, serviceOverview } = require("./dashboard.controller");
const auth = require("../../../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

router.post("/", auth, userDashboardDetails);
router.post("/service-overview", auth, serviceOverview);

module.exports = router;