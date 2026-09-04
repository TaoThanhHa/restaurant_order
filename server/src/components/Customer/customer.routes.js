const express = require("express");

const router = express.Router();

const customerController = require("./customer.controller");

const auth = require("../../middlewares/customerAuth.middleware");

router.put("/profile", auth, customerController.updateProfile);
router.put("/phone", auth, customerController.updatePhone);
router.put("/password", auth, customerController.changePassword);
router.post("/email/send-otp", auth, customerController.sendChangeEmailOtp);
router.post("/email/verify-otp", auth, customerController.verifyChangeEmailOtp);

module.exports = router;