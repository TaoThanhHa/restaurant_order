const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const controller = require("./payment.controller");

router.get(
    "/accounts",
    auth,
    authorize("ADMIN", "BRANCH"),
    controller.getAccounts
);

router.post(
    "/accounts",
    auth,
    authorize("ADMIN", "BRANCH"),
    controller.createAccount
);

router.put(
    "/accounts/:id",
    auth,
    authorize("ADMIN", "BRANCH"),
    controller.updateAccount
);

router.delete(
    "/accounts/:id",
    auth,
    authorize("ADMIN", "BRANCH"),
    controller.deleteAccount
);

router.patch(
    "/accounts/:id/status",
    auth,
    authorize("ADMIN", "BRANCH"),
    controller.toggleAccount
);

router.post(
    "/",
    auth,
    authorize("ADMIN", "BRANCH", "CASHIER"),
    controller.create
);

router.get(
    "/:id",
    auth,
    authorize("ADMIN", "BRANCH", "CASHIER"),
    controller.getById
);

router.post(
    "/:id/confirm",
    auth,
    authorize("ADMIN", "BRANCH", "CASHIER"),
    controller.confirm
);

module.exports = router;