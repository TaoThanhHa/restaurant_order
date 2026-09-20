const express = require("express");
const router = express.Router();

const controller = require("./customerAdmin.controller");
const auth = require("../../middlewares/auth.middleware");

router.get( "/statistics", auth, controller.getStatistics);
router.get( "/", auth, controller.getCustomers);
router.get( "/:id", auth, controller.getCustomerById);

module.exports = router;