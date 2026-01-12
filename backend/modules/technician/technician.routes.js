const { assignedServices, servicesList, inventory, startWork, onHoldService, updateServiceStatus, paymentRaise } = require('./technician.controller');
const auth = require('../../middleware/authMiddleware');
const express = require('express');
const upload = require("../../middleware/fileUpload");

const router = express.Router();

router.post('/assigned-list', auth, assignedServices);
router.post('/list', auth, servicesList);
router.post('/inventory', auth, inventory);
router.post('/start-work', auth, startWork);
router.post('/hold-work', auth, onHoldService);
router.post('/update-service', auth, upload.array('media', 10), updateServiceStatus);
router.post('/update-payment', auth, paymentRaise);

module.exports = router;