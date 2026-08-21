const express = require("express");

const router = express.Router();

const cashierController = require("./cashier.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.use(auth);
router.use(authorize("CASHIER"));
router.get(
    "/statistics",
    auth,
    authorize("CASHIER"),
    cashierController.getStatistics
);
router.get("/dashboard", cashierController.dashboard);

router.get("/tables", cashierController.getTables);

router.get("/orders/pending", cashierController.getPendingOrders);

router.get("/orders/serving", cashierController.getServingOrders);

router.patch("/items/:id/status", auth, authorize("CASHIER"), cashierController.updateOrderItemStatus);

router.get("/orders/open", auth, authorize("CASHIER"), cashierController.getOpenOrders);

router.get("/orders/:id", auth, authorize("CASHIER"), cashierController.getOrderDetail);

router.post("/orders/:id/payment", auth, authorize("CASHIER"), cashierController.payment);

module.exports = router;