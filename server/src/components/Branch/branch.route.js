const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

const controller = require("./branch.controller");

router.get(
    "/profile",
    auth,
    controller.getProfile
);

router.patch(
    "/change-password",
    auth,
    controller.changePassword
);

router.get("/",auth,authorize("ADMIN"),controller.getAll);

router.get("/:id",auth,authorize("ADMIN"),controller.getById);


router.post("/",auth,authorize("ADMIN"),controller.create);

router.put("/:id",auth,authorize("ADMIN"),controller.update);

router.delete("/:id",auth,authorize("ADMIN"),controller.remove);

router.patch("/:id/status",auth,authorize("ADMIN"), controller.toggleStatus);

module.exports = router;