const { add, update, list, deleteReason } = require("./accountDeleteReasons.controller");
const auth = require("../../../middleware/authMiddleware");

const express = require("express");

const router = express.Router();

router.post("/add", auth, add);
router.post("/update", auth, update);
router.get("/", list);
router.post("/delete", auth, deleteReason);

module.exports = router;