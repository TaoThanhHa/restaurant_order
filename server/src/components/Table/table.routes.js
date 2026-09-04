const express = require("express");

const router = express.Router();
const tableController = require("./table.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", auth,  tableController.getAll);
router.get("/floor/:floorId", auth,  tableController.getByFloor);
router.get("/:id", auth,  tableController.getById);
router.post("/", auth, authorize("ADMIN"), tableController.create);
router.put("/:id", auth, authorize("ADMIN"), tableController.update);
router.delete("/:id", auth, authorize("ADMIN"), tableController.remove);
router.get("/scan/:qrCode", tableController.scanQr);
router.post("/:id/open", auth,  tableController.open);

module.exports = router;