const express = require("express");

const router = express.Router();

const categoryController = require("./category.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", authMiddleware, categoryController.getAll);
router.get("/:id", authMiddleware, categoryController.getById);
router.post("/", authMiddleware,authorize("ADMIN"), categoryController.create);
router.put("/:id", authMiddleware, authorize("ADMIN"), categoryController.update);
router.delete("/:id", authMiddleware, authorize("ADMIN"), categoryController.remove);

module.exports = router;