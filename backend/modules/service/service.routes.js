const express = require('express');
const { createService, deleteService, listService, updateService } = require('./service.controller');
const upload = require('../../middleware/fileUpload');
const auth = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/add', auth, upload.fields([
    { name: 'serviceImage', maxCount: 1 },
    { name: 'serviceLogo', maxCount: 1 }
]), createService);

router.post('/edit', auth, upload.fields([
    { name: 'serviceImage', maxCount: 1 },
    { name: 'serviceLogo', maxCount: 1 }
]), updateService);

router.post('/delete', auth, deleteService);
router.get('/', listService);

module.exports = router;