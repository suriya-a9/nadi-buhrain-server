const express = require('express');
const { listSkillSet, addSkillSet, updateSkillSet, deleteSkillSet, adminList, statusToggle } = require('./technicianSkillSet.contoller');
const auth = require("../../../middleware/authMiddleware");
const router = express.Router();

router.post('/add', auth, addSkillSet);
router.get('/', listSkillSet);
router.post('/update', auth, updateSkillSet);
router.post('/delete', auth, deleteSkillSet);
router.post('/status-toggle', auth, statusToggle);
router.get('/admin-list', adminList);

module.exports = router;