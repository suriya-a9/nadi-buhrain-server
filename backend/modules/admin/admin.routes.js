const express = require('express');
const { adminRegister, adminLogin, listAdmins, updateAdmin, forgotPassword, resetPassword, deleteAdminUser, detail, listAdminUsers, setAccountStatus } = require('./admin.controller');
const auth = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/register", adminRegister);
router.post('/login', adminLogin);
router.get("/list", listAdmins);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/status-change", auth, setAccountStatus);
router.post("/:id", updateAdmin);
router.get("/detail", auth, detail);
router.post("/delete", auth, deleteAdminUser);
router.get("/admin-list", listAdminUsers);

module.exports = router;