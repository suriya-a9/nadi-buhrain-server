const { addAdvertisement, updateAdvertisement, deleteAds, statusChange, listForAdmin, listForClient } = require("./advertisement.controller");
const upload = require("../../../middleware/fileUpload");
const auth = require("../../../middleware/authMiddleware");

const express = require("express");

const router = express.Router();

router.post(
    "/add", auth,
    upload.fields([
        { name: "images", maxCount: 10 },
        { name: "video", maxCount: 1 }
    ]),
    addAdvertisement
);

router.post(
    "/update", auth,
    upload.fields([
        { name: "images", maxCount: 10 },
        { name: "video", maxCount: 1 }
    ]),
    updateAdvertisement
);

router.post('/delete', auth, deleteAds);

router.post('/status', auth, statusChange);
router.get('/list', listForAdmin);
router.get('/', listForClient);

module.exports = router;