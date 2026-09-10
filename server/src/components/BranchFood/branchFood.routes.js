const express = require("express");

const router = express.Router();

const controller = require("./branchFood.controller");
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", auth, authorize("BRANCH", "CASHIER"), controller.getAll);
router.patch("/:foodId/status", auth, authorize("BRANCH", "CASHIER"), controller.updateStatus);

module.exports = router;