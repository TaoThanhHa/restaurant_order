const express = require("express");
const router = express.Router();

const controller = require("./restaurant.controller");

router.get("/:restaurantId", controller.getPublicInfo);

module.exports = router;