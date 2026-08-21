const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

const controller = require("./admin.controller");

router.get(
    "/profile",
    auth,
    authorize("ADMIN"),
    controller.getProfile
);

router.put(
    "/restaurant",
    auth,
    authorize("ADMIN"),
    controller.updateRestaurant
);

router.post(
    "/change-email/request",
    auth,
    authorize("ADMIN"),
    controller.requestChangeEmail
);

router.post(
    "/change-email/verify",
    auth,
    authorize("ADMIN"),
    controller.verifyChangeEmail
);

router.patch(
    "/change-password",
    auth,
    authorize("ADMIN"),
    controller.changePassword
);

module.exports = router;