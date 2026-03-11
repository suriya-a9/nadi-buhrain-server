const express = require("express");
const { addAccountType, updateAccountType, listAccountType, deleteAccountType, setAccountStatus } = require("./account.controller");
const auth = require('../../../middleware/authMiddleware');

const router = express.Router();

router.post("/add", auth, addAccountType);
router.get("/", listAccountType);
router.post("/update", auth, updateAccountType);
router.post("/delete", auth, deleteAccountType);
router.post('/set-status', auth, setAccountStatus);

module.exports = router;