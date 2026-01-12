const express = require('express');
const { addTerms, listTerms, updateTerms, deleteTerms, setTermsEnabled, listAllTermsAndCondition } = require('./terms.controller');
const auth = require("../../../middleware/authMiddleware");

const router = express.Router();

router.post('/add', auth, addTerms);
router.get('/', listTerms);
router.post('/update', auth, updateTerms);
router.post('/delete', auth, deleteTerms);
router.post('/set-enabled', auth, setTermsEnabled);
router.get('/list', listAllTermsAndCondition);

module.exports = router;