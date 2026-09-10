const express = require("express");
const router = express.Router();

const controller = require("./cashier.controller");
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.use(auth);
router.use(authorize("BRANCH", "CASHIER"));
router.get("/statistics",auth,authorize("BRANCH", "CASHIER"),controller.getStatistics);
router.get("/dashboard", controller.dashboard);
router.get("/tables", controller.getTables);
router.get("/orders/pending", controller.getPendingOrders);
router.get("/orders/serving", controller.getServingOrders);
router.patch("/items/:id/status", auth, authorize("BRANCH", "CASHIER"), controller.updateOrderItemStatus);
router.get("/orders/open", auth, authorize("BRANCH" , "CASHIER"), controller.getOpenOrders);
router.get("/orders/:id", auth, authorize("BRANCH",  "CASHIER"), controller.getOrderDetail);
router.post("/orders/:id/payment", auth, authorize("BRANCH", "CASHIER"), controller.payment);

module.exports = router;