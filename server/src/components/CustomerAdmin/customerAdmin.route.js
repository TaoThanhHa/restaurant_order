const express = require("express");
const router = express.Router();
const customerAdminController = require("./customerAdmin.controller");
const auth = require("../../middlewares/auth.middleware");

router.get( "/statistics", auth, customerAdminController.getStatistics);
router.get( "/", auth, customerAdminController.getCustomers);
router.get( "/:id", auth, customerAdminController.getCustomerById);

module.exports = router;