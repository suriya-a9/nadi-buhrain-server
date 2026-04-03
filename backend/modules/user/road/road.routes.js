const express = require("express");
const { addRoad, listRoad, updateRoad, deleteRoad, listAdmin, statusToggle } = require("./road.controller");
const auth = require("../../../middleware/authMiddleware");

const router = express.Router();

router.post("/add", auth, addRoad);
router.get("/", listRoad);
router.post("/update", auth, updateRoad);
router.post("/delete", auth, deleteRoad);
router.post('/status-toggle', auth, statusToggle);
router.get('/admin-list', listAdmin);

module.exports = router;