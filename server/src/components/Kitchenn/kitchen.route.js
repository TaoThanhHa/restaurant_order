const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./kitchen.controller");

router.get("/pending", auth, role("KITCHEN"), controller.getPending);
router.get("/preparing", auth, role("KITCHEN"), controller.getPreparing);
router.get("/completed", auth, role("KITCHEN"), controller.getCompleted);
router.patch("/orders/:orderId/start", auth, role("KITCHEN"), controller.startOrder);
router.patch("/orders/:orderId/complete", auth, role("KITCHEN"), controller.completeOrder);

module.exports = router;