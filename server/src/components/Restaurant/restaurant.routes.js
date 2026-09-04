const express = require("express");

const router = express.Router();

const controller = require("./restaurant.controller");

router.get("/", controller.getPublicInfo);

module.exports = router;