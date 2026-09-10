const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const controller = require("./kitchen.controller");

router.get("/pending", auth, authorize("KITCHEN"), controller.getPending);
router.get("/preparing", auth, authorize("KITCHEN"), controller.getPreparing);
router.get("/completed", auth, authorize("KITCHEN"), controller.getCompleted);
router.patch("/orders/:orderId/start", auth, authorize("KITCHEN"), controller.startOrder);
router.patch("/orders/:orderId/complete", auth, authorize("KITCHEN"), controller.completeOrder);

module.exports = router;