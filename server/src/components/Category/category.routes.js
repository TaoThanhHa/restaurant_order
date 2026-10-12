const express = require("express");
const router = express.Router();

const controller = require("./category.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

router.get("/", auth, controller.getAll);
router.get("/:id", auth, controller.getById);

router.post("/", auth, role("ADMIN"), controller.create);
router.put("/:id", auth, role("ADMIN"), controller.update);
router.delete("/:id", auth, role("ADMIN"), controller.remove);

module.exports = router;