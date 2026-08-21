const express = require("express");

const router = express.Router();

const scanController = require("./scan.controller");

router.get("/:qrCode", scanController.scan);

module.exports = router;