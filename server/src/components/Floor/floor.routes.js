const express = require("express");
const router = express.Router();

const controller = require("./floor.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

router.get("/", auth, controller.getAll);
router.get("/branch/:branchId", auth, controller.getByBranch);
router.get("/:id", auth, controller.getById);
router.post("/", auth, role("ADMIN", "BRANCH"), controller.create);
router.put("/:id", auth, role("ADMIN", "BRANCH"), controller.update);
router.delete("/:id", auth, role("ADMIN", "BRANCH"), controller.remove);

module.exports = router;