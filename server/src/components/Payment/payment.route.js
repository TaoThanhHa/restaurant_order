const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./payment.controller");

router.get("/accounts", auth, role("ADMIN", "BRANCH"), controller.getAccounts);
router.post("/accounts", auth, role("ADMIN", "BRANCH"), controller.createAccount);
router.put("/accounts/:id", auth, role("ADMIN", "BRANCH"), controller.updateAccount);
router.delete("/accounts/:id", auth, role("ADMIN", "BRANCH"), controller.deleteAccount);
router.patch("/accounts/:id/status", auth, role("ADMIN", "BRANCH"), controller.toggleAccount);
router.post("/", auth, role("ADMIN", "BRANCH", "CASHIER"), controller.create);
router.get("/:id", auth, role("ADMIN", "BRANCH", "CASHIER"), controller.getById);
router.post("/:id/confirm", auth, role("ADMIN", "BRANCH", "CASHIER"), controller.confirm);

module.exports = router;