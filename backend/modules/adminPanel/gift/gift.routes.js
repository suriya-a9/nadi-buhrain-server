const { add, list } = require("./gift.controller");

const express = require("express");
const router = express.Router();

router.post("/add", add);
router.get('/list', list);

module.exports = router;