const { newUserServiceRequest, updateServiceStatus, assignTechnician, technicianRespond, acceptedServiceRequests, getTechnicianWorkStatus, getAllTechnicianAssignments, removeTechnicianAssignment } = require('./userServiceController.controller');
const auth = require('../../../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

router.get('/', newUserServiceRequest);
router.post('/update-status', auth, updateServiceStatus);
router.post('/assign-technician', auth, assignTechnician);
router.post('/technician-respond', auth, technicianRespond);
router.get('/accpeted-requests', acceptedServiceRequests);
router.get('/technician-work-status/:userServiceId', getTechnicianWorkStatus);
router.get('/all-technician-assignments/:userServiceId', getAllTechnicianAssignments);
router.post('/remove-technician', auth, removeTechnicianAssignment);
module.exports = router;