const express = require("express");

const router = express.Router();

router.use("/auth", require("../components/Auth/auth.routes"));
router.use("/events", require("../components/Events/event.routes"));

router.use("/customer", require("../components/CustomerAuth/customerAuth.route"));
router.use( "/customer/orders",require("../components/CustomerOrder/customerOrder.routes"));
router.use("/customer-admin", require("../components/CustomerAdmin/customerAdmin.route"));

router.use("/branches", require("../components/Branch/branch.route"));
router.use("/categories", require("../components/Category/category.routes"));
router.use("/foods", require("../components/Food/food.routes"));
router.use("/branch-foods", require("../components/BranchFood/branchFood.routes"));
router.use("/floors", require("../components/Floor/floor.routes"));
router.use("/tables", require("../components/Table/table.routes"));
router.use("/customers", require("../components/Customer/customer.routes"));
router.use("/orders", require("../components/Order/order.routes"));
router.use("/cart", require("../components/Cart/cart.routes"));
router.use("/scan", require("../components/Scan/scan.routes"));
router.use("/cashier", require("../components/Cashier/cashier.routes"));
router.use("/upload", require("../components/Upload/upload.route"));
router.use("/statistics", require("../components/AdminStatistics/adminStatistics.routes"));
router.use("/admin", require("../components/Admin/admin.routes"));
router.use("/restaurant",require("../components/Restaurant/restaurant.routes"));
router.use("/employee", require("../components/Staff/staff.routes"));
router.use("/service-requests", require("../components/ServiceRequest/serviceRequest.routes"));
router.use("/inventory", require("../components/Inventory/inventory.routes"));

module.exports = router;