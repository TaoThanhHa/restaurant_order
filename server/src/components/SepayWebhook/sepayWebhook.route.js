const express = require("express");
const router = express.Router();

const verifySePayWebhook = require("../../middlewares/sepay.middlewares");
const controller = require("./sepayWebhook.controller");

router.post("/", verifySePayWebhook, controller.handleWebhook);

module.exports = router;