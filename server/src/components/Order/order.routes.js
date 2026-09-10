const express = require("express");
const router = express.Router();

const controller = require("./order.controller");
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.post("/", auth, controller.create);
router.post("/take-away", auth, authorize("ADMIN", "BRANCH", "CASHIER"), controller.createTakeAway);
router.get("/take-away", auth, authorize("ADMIN", "BRANCH", "CASHIER"), controller.getTakeAway);
router.get("/table/:tableId/active", auth, controller.getActiveOrderByTable);
router.get("/pending", auth, authorize("BRANCH", "CASHIER"), controller.getPendingOrders);
router.get("/completed-kitchen", auth, authorize("BRANCH", "ORDER", "CASHIER", "KITCHEN"), controller.getCompletedKitchenOrders);
router.get("/history", auth, authorize("BRANCH", "ORDER", "CASHIER"), controller.getHistory);
router.post("/merge", auth, controller.mergeOrders);
router.post("/:orderId/items", auth, authorize("ADMIN", "CASHIER"), controller.addItem);
router.patch("/:id/confirm", auth, authorize("ADMIN", "BRANCH", "CASHIER"), controller.confirmItems);
router.put("/:orderId/items/:itemId", auth, authorize("ADMIN", "BRANCH", "CASHIER"), controller.updateItem);
router.delete("/:orderId/items/:itemId", auth, authorize("ADMIN", "BRANCH", "CASHIER"), controller.removeItem);
router.put("/:id/status", auth, authorize("ADMIN", "BRANCH", "CASHIER"), controller.updateStatus);
router.post("/:id/payment", auth, controller.payment);
router.get("/:id", auth, controller.getById);

module.exports = router;