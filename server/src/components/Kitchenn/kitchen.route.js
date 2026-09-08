const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

const kitchenController = require("./kitchen.controller");


// ======================================================
// KITCHEN ORDERS
// ======================================================

// Hàng chờ
router.get(
    "/pending",
    auth,
    authorize("KITCHEN"),
    kitchenController.getPending
);

// Đang chế biến
router.get(
    "/preparing",
    auth,
    authorize("KITCHEN"),
    kitchenController.getPreparing
);

// Đã hoàn thành trong ngày
router.get(
    "/completed",
    auth,
    authorize("KITCHEN"),
    kitchenController.getCompleted
);


// ======================================================
// KITCHEN ACTIONS
// ======================================================

// Bắt đầu chế biến cả đơn
router.patch(
    "/orders/:orderId/start",
    auth,
    authorize("KITCHEN"),
    kitchenController.startOrder
);

// Hoàn thành cả đơn
router.patch(
    "/orders/:orderId/complete",
    auth,
    authorize("KITCHEN"),
    kitchenController.completeOrder
);


module.exports = router;