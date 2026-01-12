const { dashboardCharts, totalCounts } = require('./dashboard.controller');

const express = require('express');
const router = express.Router();

router.get('/counts', dashboardCharts);
router.get('/technicians', totalCounts);

module.exports = router;