const express = require('express');
const { createRequest, userServiceList, ongoingRequest } = require('./userService.controller');
const router = express.Router();
const upload = require('../../../middleware/fileUpload');
const auth = require('../../../middleware/authMiddleware');

router.post('/create', auth, upload.array('media', 10), createRequest);
router.post('/ongoin', auth, ongoingRequest)
router.post('/', auth, userServiceList);

module.exports = router;