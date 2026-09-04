const express = require("express");

const router = express.Router();

const orderController = require("./order.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.post("/", auth, orderController.create);
router.get("/table/:tableId/active", auth, orderController.getActiveOrderByTable);
router.get("/pending", auth, authorize("BRANCH", "CASHIER"), orderController.getPendingOrders);
router.get("/history", auth, authorize("BRANCH", "ORDER", "CASHIER"), orderController.getHistory);
router.get("/:id",auth,orderController.getById);
router.put("/:id/status",auth,authorize("ADMIN", "BRANCH", "CASHIER"),orderController.updateStatus);
router.post("/:id/payment",auth,orderController.payment);
router.post("/merge", auth, orderController.mergeOrders);
router.post("/:orderId/items", auth, authorize("ADMIN"),orderController.addItem);
router.patch("/:id/confirm", auth, authorize("ADMIN", "BRANCH", "CASHIER"), orderController.confirmItems);
router.put("/:orderId/items/:itemId",auth,authorize("ADMIN", "BRANCH", "CASHIER"),orderController.updateItem);
router.delete("/:orderId/items/:itemId", auth, authorize("ADMIN", "BRANCH", "CASHIER"), orderController.removeItem);
router.post("/take-away", auth, authorize("ADMIN","BRANCH", "CASHIER"), orderController.createTakeAway);
router.get("/take-away", auth, authorize("ADMIN","BRANCH", "CASHIER"), orderController.getTakeAway);

module.exports = router;