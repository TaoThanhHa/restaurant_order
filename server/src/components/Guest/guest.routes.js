const express = require("express");

const router = express.Router();

const guestOrderController = require("./guest.order.controller");
const guestAuth = require("../../middlewares/guest.middleware");

  
// GUEST ORDER
  

// Chi tiết đơn hàng
router.get(
  "/orders/:id",
  guestAuth,
  guestOrderController.getById
);

// Thêm món
router.post(
  "/orders/:orderId/items",
  guestAuth,
  guestOrderController.addItem
);

// Cập nhật món
router.put(
  "/orders/:orderId/items/:itemId",
  guestAuth,
  guestOrderController.updateItem
);

// Hủy món
router.delete(
  "/orders/:orderId/items/:itemId",
  guestAuth,
  guestOrderController.removeItem
);

module.exports = router;