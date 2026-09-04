const express = require("express");

const router = express.Router();

const branchFoodController = require("./branchFood.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", auth, authorize("BRANCH", "CASHIER"), branchFoodController.getAll);
router.patch("/:foodId/status", auth, authorize("BRANCH", "CASHIER"), branchFoodController.updateStatus);

module.exports = router;