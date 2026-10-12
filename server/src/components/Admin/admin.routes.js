const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const controller = require("./admin.controller");

router.get("/profile",auth,controller.getProfile);
router.put("/restaurant",auth,role("ADMIN"),controller.updateRestaurant);
router.post("/change-email/request",auth,role("ADMIN"),controller.requestChangeEmail);
router.post("/change-email/verify",auth,role("ADMIN"),controller.verifyChangeEmail);
router.patch("/change-password",auth,role("ADMIN"),controller.changePassword);

module.exports = router;