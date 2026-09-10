const express = require("express");
const router = express.Router();

const { foodUpload, restaurantUpload, customerAvatarUpload,} = require("../../middlewares/upload.middleware");
const controller = require("./upload.controller");
const customerAuth = require("../../middlewares/customerAuth.middleware");

router.post( "/food", foodUpload.single("image"), controller.uploadFoodImage);
router.post( "/restaurant-logo", restaurantUpload.single("image"), controller.uploadRestaurantLogo);
router.post( "/customer-avatar", customerAuth, customerAvatarUpload.single("image"), controller.uploadCustomerAvatar);

module.exports = router;