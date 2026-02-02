const { addPopUp, editPopup, deletePopUp, submitQuestionnaire, questionnaire, questionnaireDetail, listQuestionnaires, statusChange, listForClient } = require("./popUp.controller");
const auth = require("../../../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

router.post('/add', auth, addPopUp);
router.post('/edit', auth, editPopup);
router.post('/delete', auth, deletePopUp);
router.post('/submit', auth, submitQuestionnaire);
router.post('/questionnaire', questionnaire);
router.post('/detail', questionnaireDetail);
router.get('/list', listQuestionnaires);
router.post('/status-change', auth, statusChange);
router.get('/', auth, listForClient);

module.exports = router;