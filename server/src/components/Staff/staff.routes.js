const express = require("express");
const router = express.Router();

const controller = require("./staff.controller");
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.use(auth, authorize("BRANCH"));
router.get("/", controller.getAll);
router.get("/:userId", controller.getById);
router.post("/", controller.create);
router.put("/:userId", controller.update);
router.patch("/:userId/toggle-status", controller.toggleStatus);

module.exports = router;
