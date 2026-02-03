const { addQuestionnaire, questionnaire, submitQuestionnaire, editQuestionnaire, deleteQuestionnaire, questionnaireDetail, listQuestionnaires, listForClient } = require("./questionnaire.controller");
const auth = require("../../../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

router.post("/add", auth, addQuestionnaire);
router.post("/questionnaire", auth, questionnaire);
router.post("/submit", auth, submitQuestionnaire);
router.post("/edit", auth, editQuestionnaire);
router.post("/delete", auth, deleteQuestionnaire);
router.post("/detail", auth, questionnaireDetail);
router.get("/list", listQuestionnaires);
router.get("/", auth, listForClient);

module.exports = router;