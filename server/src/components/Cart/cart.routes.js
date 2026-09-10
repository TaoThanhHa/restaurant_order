const express = require("express");

const router = express.Router();

const controller = require("./cart.controller");

router.get("/:guestToken", controller.getCart);
router.post("/items", controller.addItem);
router.delete("/items/:id", controller.removeItem);

module.exports = router;