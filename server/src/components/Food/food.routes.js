const express = require("express");

const router = express.Router();

const foodController = require("./food.controller");
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", auth, foodController.getAll);
router.get("/branch", auth, foodController.getByBranch);
router.get("/:id", auth, foodController.getById);
router.post("/", auth, authorize("ADMIN"), foodController.create);
router.put("/:id", auth, authorize("ADMIN"), foodController.update);
router.delete("/:id", auth, authorize("ADMIN"), foodController.remove);
router.get("/qr/:qrCode", foodController.getByQrCode);

module.exports = router;