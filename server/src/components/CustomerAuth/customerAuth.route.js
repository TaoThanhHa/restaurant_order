const express = require("express");

const router = express.Router();

const controller = require("./customerAuth.controller");

const customerAuth = require("../../middlewares/customerAuth.middleware");

router.post("/guest", controller.guest);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/profile", customerAuth, controller.profile);
router.get("/table/:qrCode", controller.getTable);

module.exports = router;