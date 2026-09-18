const express = require("express");
const router = express.Router();

const controller = require("./cart.controller");
const customerAuthMiddleware = require("../../middlewares/customerAuth.middleware");

router.get("/", customerAuthMiddleware, controller.getCart);
router.post("/items", customerAuthMiddleware, controller.addItem);
router.delete("/items/:id", customerAuthMiddleware, controller.removeItem);

module.exports = router;