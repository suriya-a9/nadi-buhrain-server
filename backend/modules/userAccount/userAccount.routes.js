const express = require("express");
const router = express.Router();
const controller = require("./userAccount.controller");
const upload = require("../../middleware/fileUpload");
const auth = require("../../middleware/authMiddleware");

router.post("/", controller.startSignUp);
router.post("/basic-info", controller.saveBasicInfo);
router.post("/address", controller.saveAddress);
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);

router.post("/upload-id", upload.array("idProof", 5), controller.uploadIdProof);

router.post("/add-family-member", controller.addFamilyMember);

router.post("/terms-verify", controller.termsAndConditionVerify);

router.post("/complete", controller.completeSignUp);

router.post('/profile', controller.userprofile);
router.post(
  '/profile-update',
  upload.fields([
    { name: "idProof", maxCount: 5 },
    { name: "image", maxCount: 1 }
  ]),
  controller.updateBasicInfoAndAddress
);

router.post('/signin', controller.signIn)

router.post('/send-signin-otp', controller.sendSignInOtp);
router.post('/signin-otp', controller.signInWithOtp);

router.post("/forgot-password", controller.forgotPassword);
router.post("/user/reset-password/:token", controller.resetPassword);
router.post("/delete-user", controller.deleteUser);

router.post('/notification', auth, controller.listNotification);

router.post('/logout', auth, controller.logout);

router.get("/list-with-last-message", auth, controller.listAdminsWithLastMessage);

router.post("/delete", auth, controller.setUserStatus);

router.post("/notification-status", auth, controller.notificationStatus);

router.post("/status", auth, controller.notificationStatusSet);

module.exports = router;