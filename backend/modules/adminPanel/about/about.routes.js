const { addAbout, listAbout, updateAbout, deleteAbout, listToUser, toggleAboutStatus } = require("./about.controller");
const auth = require("../../../middleware/authMiddleware");
const upload = require('../../../middleware/fileUpload');
const express = require("express");

const router = express.Router();

router.post("/add", auth, upload.fields([
    { name: 'media', maxCount: 1 },
]), addAbout);

router.get("/list", listAbout);

router.get("/", listToUser);

router.post("/update", auth, upload.fields([
    { name: 'media', maxCount: 1 },
]), updateAbout);

router.post("/status", auth, toggleAboutStatus);

router.post("/delete", auth, deleteAbout);

module.exports = router;