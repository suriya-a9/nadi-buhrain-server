const express = require("express");
const { addBlock, listBlockWithRoads, updateBlock, deleteBlock, listForAdmin, statusToggle } = require("./block.controller");
const auth = require("../../../middleware/authMiddleware");

const router = express.Router();

router.post("/add", auth, addBlock);
router.get("/", listBlockWithRoads);
router.post("/update", auth, updateBlock);
router.post("/delete", auth, deleteBlock);
router.post('/status-toggle', auth, statusToggle);
router.get('/admin-list', listForAdmin);

module.exports = router;