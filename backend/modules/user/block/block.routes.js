const express = require("express");
const { addBlock, listBlockWithRoads, updateBlock, deleteBlock } = require("./block.controller");
const auth = require("../../../middleware/authMiddleware");

const router = express.Router();

router.post("/add", auth, addBlock);
router.get("/", listBlockWithRoads);
router.post("/update", auth, updateBlock);
router.post("/delete", auth, deleteBlock);

module.exports = router;