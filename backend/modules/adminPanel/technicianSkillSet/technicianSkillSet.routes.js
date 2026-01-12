const express = require('express');
const { listSkillSet, addSkillSet, updateSkillSet, deleteSkillSet } = require('./technicianSkillSet.contoller');
const auth = require("../../../middleware/authMiddleware");
const router = express.Router();

router.post('/add', auth, addSkillSet);
router.get('/', listSkillSet);
router.post('/update', auth, updateSkillSet);
router.post('/delete', auth, deleteSkillSet);

module.exports = router;