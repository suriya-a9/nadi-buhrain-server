const express = require("express");
const { addAccountType, updateAccountType, listAccountType, deleteAccountType } = require("./account.controller");
const auth = require('../../../middleware/authMiddleware');

const router = express.Router();

router.post("/add", auth, addAccountType);
router.get("/", listAccountType);
router.post("/update", auth, updateAccountType);
router.post("/delete", auth, deleteAccountType);

module.exports = router;