const express = require("express");

const router = express.Router();

const controller = require("./branchFood.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

router.get("/", auth, role("BRANCH", "CASHIER"), controller.getAll);
router.patch("/:foodId/status", auth, role("BRANCH", "CASHIER"), controller.updateStatus);

module.exports = router;