const express = require("express");

const router = express.Router();

const customerController =
    require("./customer.controller");

const auth =
    require("../../middlewares/customerAuth.middleware");

// ======================================================
// CUSTOMER PROFILE - NAME
// ======================================================

router.put(
    "/profile",
    auth,
    customerController.updateProfile
);

// ======================================================
// CUSTOMER ACCOUNT
// ======================================================

router.put(
    "/phone",
    auth,
    customerController.updatePhone
);

router.put(
    "/password",
    auth,
    customerController.changePassword
);

// ======================================================
// CHANGE EMAIL
// ======================================================

router.post(
    "/email/send-otp",
    auth,
    customerController.sendChangeEmailOtp
);

router.post(
    "/email/verify-otp",
    auth,
    customerController.verifyChangeEmailOtp
);

module.exports = router;