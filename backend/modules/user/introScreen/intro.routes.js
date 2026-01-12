const express = require('express');
const { addIntro, getIntro, updateIntro, deleteIntro, listIntro, setIntroStatus } = require('./intro.controller');
const auth = require('../../../middleware/authMiddleware');

const router = express.Router();

router.post('/add', auth, addIntro);
router.get('/', getIntro);
router.post('/update', auth, updateIntro);
router.post('/delete', auth, deleteIntro);
router.get('/list', listIntro);
router.post('/set-status', auth, setIntroStatus);

module.exports = router;