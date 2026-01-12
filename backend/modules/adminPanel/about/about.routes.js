const { addAbout, listAbout, updateAbout, deleteAbout } = require("./about.controller");
const auth = require("../../../middleware/authMiddleware");
const upload = require('../../../middleware/fileUpload');
const express = require("express");

const router = express.Router();

router.post("/add", auth, upload.fields([
    { name: 'media', maxCount: 1 },
]), addAbout);

router.get("/", listAbout);

router.post("/update", auth, upload.fields([
    { name: 'media', maxCount: 1 },
]), updateAbout);

router.post("/delete", auth, deleteAbout);

module.exports = router;