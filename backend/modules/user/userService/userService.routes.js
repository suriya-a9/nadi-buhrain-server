const express = require('express');
const { createRequest, userServiceList, ongoingRequest, approvalList, approveWork, markAsCompleted, addUserComment } = require('./userService.controller');
const router = express.Router();
const upload = require('../../../middleware/fileUpload');
const auth = require('../../../middleware/authMiddleware');

router.post('/create', auth, upload.fields([
    { name: 'media', maxCount: 10 },
    { name: 'voice', maxCount: 1 }
]), createRequest);
router.post('/ongoin', auth, ongoingRequest)
router.post('/', auth, userServiceList);
router.get('/approve-list', auth, approvalList);
router.post('/approve-work', auth, approveWork);
router.post('/mark-as-completed', auth, markAsCompleted);
router.post('/add-comment', addUserComment);

module.exports = router;