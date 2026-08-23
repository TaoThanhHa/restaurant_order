const express = require("express");

const router = express.Router();
const floorController = require("./floor.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", auth, authorize("ADMIN", "CASHIER","ORDER"), floorController.getAll);
router.get(
    "/branch/:branchId",
    auth,
    authorize("ADMIN", "CASHIER", "ORDER"),
    floorController.getByBranch
);
router.get("/:id", auth, authorize("ADMIN", "CASHIER", "ORDER"), floorController.getById);
router.post("/", auth, authorize("ADMIN"), floorController.create);
router.put("/:id", auth, authorize("ADMIN"), floorController.update);
router.delete("/:id", auth, authorize("ADMIN"), floorController.remove);

module.exports = router;