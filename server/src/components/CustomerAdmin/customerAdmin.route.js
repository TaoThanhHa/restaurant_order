const express = require("express");

const router =
    express.Router();

const customerAdminController =
    require("./customerAdmin.controller");

const auth =
    require("../../middlewares/auth.middleware");


// ======================================================
// CUSTOMER ADMIN
// ======================================================


// Thống kê tổng quan
router.get(
    "/statistics",
    auth,
    customerAdminController.getStatistics
);


// Danh sách khách hàng
router.get(
    "/",
    auth,
    customerAdminController.getCustomers
);


// Chi tiết khách hàng
router.get(
    "/:id",
    auth,
    customerAdminController.getCustomerById
);


module.exports = router;