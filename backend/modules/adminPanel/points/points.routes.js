const express = require('express');
const { addPoints, listPoints, updatePoints, transferPointsWithFamily, requestPointsToFamily, requestList, requestToAdmin, listAdminRequest, handleAdminRequestAction } = require('./points.controller');
const auth = require('../../../middleware/authMiddleware');

const router = express.Router();

router.post('/add', auth, addPoints);
router.get('/', listPoints);
router.post('/update', auth, updatePoints);
router.post('/transfer-points', auth, transferPointsWithFamily);
router.post('/requestToFamily', auth, requestPointsToFamily);
router.post('/requestList', auth, requestList);
router.post('/requestToAdmin', auth, requestToAdmin);
router.get('/listRequestToAdmin', listAdminRequest);
router.post('/adminRequestAction', auth, handleAdminRequestAction);

module.exports = router;