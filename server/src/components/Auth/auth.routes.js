const express = require("express");

const router = express.Router();

const controller = require("./auth.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.post("/login", controller.login);
router.get("/profile", authMiddleware, controller.profile);
router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-otp", controller.verifyOtp);
router.post("/reset-password", controller.resetPassword);

module.exports = router;