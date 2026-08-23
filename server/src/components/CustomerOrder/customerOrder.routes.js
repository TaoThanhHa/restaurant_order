// customerOrder.routes.js
const express = require("express");

const router = express.Router();

const customerAuth = require("../../middlewares/customerAuth.middleware");

const controller = require("./customerOrder.controller");

router.post(
    "/",
    customerAuth,
    controller.create
);

module.exports = router;