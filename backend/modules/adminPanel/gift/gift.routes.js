const { add, list, listGift, markGiftsAsRead } = require("./gift.controller");
const auth = require("../../../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

router.post("/add", add);
router.get('/list', list);
router.post('/', auth, listGift);
router.post('/mark-as-read', auth, markGiftsAsRead);

module.exports = router;