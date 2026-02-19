const { send, list } = require("./helpAndSupportEnquiry.controller");

const express = require("express");
const router = express.Router();

router.post('/send', send);
router.get('/', list);

module.exports = router;