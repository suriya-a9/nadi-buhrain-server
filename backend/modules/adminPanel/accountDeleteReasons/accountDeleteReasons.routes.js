const { add, update, list, deleteReason, listForUser } = require("./accountDeleteReasons.controller");
const auth = require("../../../middleware/authMiddleware");

const express = require("express");

const router = express.Router();

router.post("/add", auth, add);
router.post("/update", auth, update);
router.get("/list", list);
router.post("/delete", auth, deleteReason);
router.get("/", listForUser);

module.exports = router;