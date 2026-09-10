const express = require("express");
const router = express.Router();

const controller = require("./category.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", authMiddleware, controller.getAll);
router.get("/:id", authMiddleware, controller.getById);
router.post("/", authMiddleware,authorize("ADMIN"), controller.create);
router.put("/:id", authMiddleware, authorize("ADMIN"), controller.update);
router.delete("/:id", authMiddleware, authorize("ADMIN"), controller.remove);

module.exports = router;