const express = require("express");

const router = express.Router();

const cartController = require("./cart.controller");

router.get("/:guestToken", cartController.getCart);
router.post("/items", cartController.addItem);
router.delete("/items/:id", cartController.removeItem);

module.exports = router;