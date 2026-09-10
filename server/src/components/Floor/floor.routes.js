const express = require("express");
const router = express.Router();

const controller = require("./floor.controller");
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", auth, controller.getAll);
router.get("/branch/:branchId", auth, controller.getByBranch);
router.get("/:id", auth, controller.getById);
router.post("/", auth, authorize("ADMIN"), controller.create);
router.put("/:id", auth, authorize("ADMIN"), controller.update);
router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

module.exports = router;