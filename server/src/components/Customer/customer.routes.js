const express = require("express");
const router = express.Router();

const controller = require("./customer.controller");
const auth = require("../../middlewares/customerAuth.middleware");

router.put("/profile", auth, controller.updateProfile);
router.put("/phone", auth, controller.updatePhone);
router.put("/password", auth, controller.changePassword);
router.post("/email/send-otp", auth, controller.sendChangeEmailOtp);
router.post("/email/verify-otp", auth, controller.verifyChangeEmailOtp);

router.post("/guest", controller.guest);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/table/:qrCode", controller.getTable);
router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-otp", controller.verifyOtp);
router.post("/reset-password", controller.resetPassword);

router.get("/profile", auth, controller.profile);

module.exports = router;
