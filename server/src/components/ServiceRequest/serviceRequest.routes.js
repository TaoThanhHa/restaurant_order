const express = require("express");

const router = express.Router();

const controller =require("./serviceRequest.controller");

const auth =require("../../middlewares/auth.middleware");
const customerAuth =require("../../middlewares/customerAuth.middleware");
const authorize =require("../../middlewares/role.middleware");

router.post("/",customerAuth,controller.create);
router.get("/customer",customerAuth,controller.getCustomerRequests);
router.get("/:id/status",controller.getStatus);
router.get("/",auth,authorize("CASHIER"),controller.getAll);
router.patch("/:id/accept",auth,authorize("CASHIER"),controller.accept);
router.patch("/:id/complete",auth,authorize("CASHIER"),controller.complete);

module.exports = router;