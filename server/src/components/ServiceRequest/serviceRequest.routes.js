const express = require("express");

const router = express.Router();

const controller =
    require("./serviceRequest.controller");

const auth =
    require("../../middlewares/auth.middleware");

const customerAuth =
    require("../../middlewares/customerAuth.middleware");

const authorize =
    require("../../middlewares/role.middleware");


// ======================================================
// CUSTOMER
// ======================================================

// Khách gửi yêu cầu
router.post(
    "/",
    customerAuth,
    controller.create
);

// Khách xem yêu cầu của mình
router.get(
    "/customer",
    customerAuth,
    controller.getCustomerRequests
);

// Xem trạng thái yêu cầu
router.get(
    "/:id/status",
    controller.getStatus
);


// ======================================================
// CASHIER
// ======================================================

// Cashier lấy danh sách yêu cầu
router.get(
    "/",
    auth,
    authorize("CASHIER"),
    controller.getAll
);

// Cashier xác nhận
router.patch(
    "/:id/accept",
    auth,
    authorize("CASHIER"),
    controller.accept
);

// Cashier hoàn thành
router.patch(
    "/:id/complete",
    auth,
    authorize("CASHIER"),
    controller.complete
);


module.exports = router;