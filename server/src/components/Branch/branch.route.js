const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./branch.controller");

router.get("/profile", auth, controller.getProfile);
router.patch("/change-password", auth, controller.changePassword);
router.get("/", auth, role("ADMIN"), controller.getAll);
router.get("/single", auth, role("ADMIN"), controller.getSingleBranch);
router.get("/:id", auth, role("ADMIN", "BRANCH"), controller.getById);
router.post("/", auth, role("ADMIN"), controller.create);
router.put("/:id", auth, role("ADMIN"), controller.update);
router.delete("/:id", auth, role("ADMIN"), controller.remove);
router.patch("/:id/status", auth, role("ADMIN"), controller.toggleStatus);

module.exports = router;
