const { addPolicy, listPrivacy, updatePrivacy, deletePrivacy, listUserPrivacy, togglePrivacyStatus } = require("./privacyPolicy.controller");
const auth = require("../../../middleware/authMiddleware");
const upload = require("../../../middleware/fileUpload");
const express = require("express");

const router = express.Router();

router.post("/add", auth, auth, upload.fields([
    { name: 'media', maxCount: 1 },
]), addPolicy);

router.get("/", listUserPrivacy);
router.get("/list", listPrivacy);

router.post("/update", auth, upload.fields([
    { name: 'media', maxCount: 1 },
]), updatePrivacy);

router.post("/status", auth, togglePrivacyStatus);

router.post("/delete", auth, deletePrivacy);

module.exports = router;