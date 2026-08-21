const express = require("express");

const router = express.Router();

const branchFoodController = require("./branchFood.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", auth, authorize("CASHIER"), branchFoodController.getAll);
router.patch("/:foodId/status", auth, authorize("CASHIER"), branchFoodController.updateStatus);

module.exports = router;