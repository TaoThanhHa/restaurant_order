const express = require("express");

const router = express.Router();
const controller = require("./table.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

router.get("/", auth,  controller.getAll);
router.get("/floor/:floorId", auth,  controller.getByFloor);
router.get("/:id", auth,  controller.getById);
router.post("/", auth, role("ADMIN","BRANCH"), controller.create);
router.put("/:id", auth, role("ADMIN","BRANCH"), controller.update);
router.delete("/:id", auth, role("ADMIN","BRANCH"), controller.remove);
router.put("/:id/transfer", auth, role("ADMIN", "BRANCH", "CASHIER"), controller.transferTable);
router.post("/:id/merge", auth, role("ADMIN", "BRANCH", "CASHIER"),controller.mergeTables);
router.get("/scan/:qrCode", controller.scanQr);
router.post("/:id/open", auth,  controller.open);

module.exports = router;