const express = require('express');
const { addPoints, listPoints, updatePoints, transferPointsWithFamily, requestPointsToFamily, requestList, requestToAdmin, listAdminRequest, handleAdminRequestAction, pointsHistory, listFamilyMembersWithPoints, requestedList, peopleList, requestWithOutMobileNumber, listClientPointAdminRequest } = require('./points.controller');
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
router.post('/history', auth, pointsHistory);
router.get('/family-members', auth, listFamilyMembersWithPoints);
router.post('/requested-list', auth, requestedList);
router.post('/people-list', auth, peopleList);
router.post('/request-with-id', auth, requestWithOutMobileNumber);
router.post('/listadmin', auth, listClientPointAdminRequest)

module.exports = router;