const express = require("express");

const router = express.Router();

const authController = require("./auth.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.profile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;