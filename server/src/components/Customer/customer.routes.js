const express = require("express");
const router = express.Router();

const controller = require("./customer.controller");
const auth = require("../../middlewares/customerAuth.middleware");

router.put("/profile", auth, controller.updateProfile);
router.put("/phone", auth, controller.updatePhone);
router.put("/password", auth, controller.changePassword);
router.post("/email/send-otp", auth, controller.sendChangeEmailOtp);
router.post("/email/verify-otp", auth, controller.verifyChangeEmailOtp);

module.exports = router;