const express = require("express");

const router = express.Router();

const staffController = require("./staff.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.use(auth, authorize("BRANCH"));
router.get("/", staffController.getAll);
router.get("/:userId", staffController.getById);
router.post("/", staffController.create);
router.put("/:userId", staffController.update);
router.patch("/:userId/toggle-status", staffController.toggleStatus);

module.exports = router;
