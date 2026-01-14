const { addHelp, userList, list, updateHelp, toggleStatus, deleteHelp } = require("./helpAndSupport.controller");
const auth = require("../../../middleware/authMiddleware");
const express = require("express");

const router = express.Router();

router.post("/add", auth, addHelp);
router.get("/", userList);
router.get("/list", list);
router.post("/update", auth, updateHelp);
router.post("/status", auth, toggleStatus);
router.post("/delete", auth, deleteHelp);

module.exports = router;