const express = require("express");

const router = express.Router();

const cashierController = require("./cashier.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.use(auth);
router.use(authorize("BRANCH"));
router.get(
    "/statistics",
    auth,
    authorize("BRANCH"),
    cashierController.getStatistics
);
router.get("/dashboard", cashierController.dashboard);

router.get("/tables", cashierController.getTables);

router.get("/orders/pending", cashierController.getPendingOrders);

router.get("/orders/serving", cashierController.getServingOrders);

router.patch("/items/:id/status", auth, authorize("BRANCH", "CASHIER"), cashierController.updateOrderItemStatus);

router.get("/orders/open", auth, authorize("BRANCH" , "CASHIER"), cashierController.getOpenOrders);

router.get("/orders/:id", auth, authorize("BRANCH",  "CASHIER"), cashierController.getOrderDetail);

router.post("/orders/:id/payment", auth, authorize("BRANCH", "CASHIER"), cashierController.payment);

module.exports = router;