const express = require("express");
const { addRole, listRoles, updateRole, deleteRole } = require("./role.controller");
const auth = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/add", auth, addRole);
router.get("/", listRoles);
router.post("/update", auth, updateRole);
router.post("/delete", auth, deleteRole);

module.exports = router;