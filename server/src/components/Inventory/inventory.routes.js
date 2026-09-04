const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

const controller = require("./inventory.controller");

router.use(auth, authorize("WAREHOUSE"));
router.get("/ingredients", controller.getAllIngredients);
router.get("/ingredients/:id", controller.getIngredientById);
router.post("/ingredients", controller.createIngredient);
router.put("/ingredients/:id", controller.updateIngredient);
router.patch("/ingredients/:id/toggle-status", controller.toggleStatus);
router.get("/stock", controller.getInventoryByBranch);
router.post("/import", controller.importInventory);
router.post("/export", controller.exportInventory);
router.post("/adjust", controller.adjustInventory);
router.get("/transactions", controller.getInventoryTransactions);

module.exports = router;