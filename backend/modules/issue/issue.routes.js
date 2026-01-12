const express = require('express');
const { addIssue, listIssue, updateIssue, deleteIssue } = require('./issue.controller');
const auth = require("../../middleware/authMiddleware");
const router = express.Router();

router.post('/add', auth, addIssue);
router.get('/', listIssue);
router.post('/update', auth, updateIssue);
router.post('/delete', auth, deleteIssue);

module.exports = router