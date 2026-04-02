const express = require('express');
const { addIssue, listIssue, updateIssue, deleteIssue, listIssueForAdmin, statusToggle } = require('./issue.controller');
const auth = require("../../middleware/authMiddleware");
const router = express.Router();

router.post('/add', auth, addIssue);
router.get('/', listIssue);
router.get('/list', listIssueForAdmin);
router.post('/update', auth, updateIssue);
router.post('/delete', auth, deleteIssue);
router.post('/status-toggle', auth, statusToggle);

module.exports = router