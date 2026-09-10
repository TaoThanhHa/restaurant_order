const express = require("express");
const router = express.Router();

const controller = require("./customerAuth.controller");
const customerAuth = require("../../middlewares/customerAuth.middleware");

router.post("/guest", controller.guest);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/table/:qrCode", controller.getTable);
router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-otp", controller.verifyOtp);
router.post("/reset-password", controller.resetPassword);
router.get("/profile", customerAuth, controller.profile);

module.exports = router;