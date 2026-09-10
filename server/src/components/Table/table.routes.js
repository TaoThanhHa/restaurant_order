const express = require("express");

const router = express.Router();
const controller = require("./table.controller");
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", auth,  controller.getAll);
router.get("/floor/:floorId", auth,  controller.getByFloor);
router.get("/:id", auth,  controller.getById);
router.post("/", auth, authorize("ADMIN","BRANCH"), controller.create);
router.put("/:id", auth, authorize("ADMIN","BRANCH"), controller.update);
router.delete("/:id", auth, authorize("ADMIN","BRANCH"), controller.remove);
router.get("/scan/:qrCode", controller.scanQr);
router.post("/:id/open", auth,  controller.open);

module.exports = router;