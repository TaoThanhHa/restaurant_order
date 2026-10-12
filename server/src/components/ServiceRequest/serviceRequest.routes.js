const express = require("express");
const router = express.Router();

const controller =require("./serviceRequest.controller");
const auth =require("../../middlewares/auth.middleware");
const customerAuth =require("../../middlewares/customerAuth.middleware");
const role =require("../../middlewares/role.middleware");

router.post("/",customerAuth,controller.create);
router.get("/customer",customerAuth,controller.getCustomerRequests);
router.get("/:id/status",controller.getStatus);
router.get("/",auth,role("CASHIER", "ORDER"),controller.getAll);
router.patch("/:id/accept",auth,role("CASHIER", "ORDER"),controller.accept);
router.patch("/:id/complete",auth,role("CASHIER", "ORDER"),controller.complete);

module.exports = router;