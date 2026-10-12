const express = require("express");
const router = express.Router();

const controller = require("./cashier.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

router.use(auth);
router.use(role("BRANCH", "CASHIER"));
router.get("/statistics",auth,role("BRANCH", "CASHIER"),controller.getStatistics);
router.get("/dashboard", controller.dashboard);
router.get("/tables", controller.getTables);
router.get("/orders/pending", controller.getPendingOrders);
router.get("/orders/serving", controller.getServingOrders);
router.patch("/items/:id/status", auth, role("BRANCH", "CASHIER"), controller.updateOrderItemStatus);
router.get("/orders/open", auth, role("BRANCH" , "CASHIER"), controller.getOpenOrders);
router.get("/orders/:id", auth, role("BRANCH",  "CASHIER"), controller.getOrderDetail);
router.post("/orders/:id/payment", auth, role("BRANCH", "CASHIER"), controller.payment);

module.exports = router;