const express = require("express");

const router = express.Router();

const orderController = require("./order.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

  
// ORDER
  

// Tạo đơn
router.post(
  "/",
  auth,
  orderController.create
);

router.get(
  "/table/:tableId/active",
  auth,
  orderController.getActiveOrderByTable
);

router.get(
    "/pending",
    auth,
    authorize("CASHIER"),
    orderController.getPendingOrders
);

router.get(
    "/history",
    auth,
    authorize("CASHIER", "ORDER"),
    orderController.getHistory
);


// Chi tiết đơn
router.get(
  "/:id",
  auth,
  orderController.getById
);

// Cập nhật trạng thái
router.put(
  "/:id/status",
  auth,
  authorize("ADMIN", "CASHIER"),
  orderController.updateStatus
);

// Thanh toán
router.post(
  "/:id/payment",
  auth,
  orderController.payment
);

router.post(
    "/merge",
    auth,
    orderController.mergeOrders
);

  
// ORDER ITEM
  

// Thêm món
router.post(
  "/:orderId/items",
  auth,
  orderController.addItem
);

//Xác nhận
router.patch(
    "/:id/confirm",
    auth,
    authorize("ADMIN","CASHIER"),
    orderController.confirmItems
);

// Sửa món
router.put(
  "/:orderId/items/:itemId",
  auth,
  authorize("ADMIN", "CASHIER"),
  orderController.updateItem
);

// Xóa món
router.delete(
    "/:orderId/items/:itemId",
    auth,
    authorize("ADMIN", "CASHIER"),
    orderController.removeItem
);
//Order mang về
router.post(
    "/take-away",
    auth,
    authorize("ADMIN","CASHIER"),
    orderController.createTakeAway
);
router.get(
    "/take-away",
    auth,
    authorize("ADMIN","CASHIER"),
    orderController.getTakeAway
);
module.exports = router;