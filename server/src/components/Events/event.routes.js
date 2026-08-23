const express = require("express");

const router = express.Router();

const controller = require("./event.controller");

const customerAuth =
    require("../../middlewares/customerAuth.middleware");

const auth =
    require("../../middlewares/auth.middleware");

// ======================================================
// CUSTOMER
// ======================================================

router.get(
    "/customer",
    customerAuth,
    controller.customerStream
);

// ======================================================
// STAFF
// ======================================================

router.get(
    "/branch",
    auth,
    controller.branchStream
);

module.exports = router;