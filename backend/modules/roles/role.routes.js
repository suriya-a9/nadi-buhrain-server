const express = require("express");
const { addRole, listRoles, updateRole, deleteRole, statusToggle, adminRoleList } = require("./role.controller");
const auth = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/add", auth, addRole);
router.get("/", listRoles);
router.post("/update", auth, updateRole);
router.post("/delete", auth, deleteRole);
router.post("/status-toggle", auth, statusToggle);
router.get("/admin-list", adminRoleList);

module.exports = router;