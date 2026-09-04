const express = require("express");

const router = express.Router();

const {
    foodUpload,
    restaurantUpload,
    customerAvatarUpload,
} = require("../../middlewares/upload.middleware");

const uploadController = require("./upload.controller");
const customerAuth = require("../../middlewares/customerAuth.middleware");

router.post( "/food", foodUpload.single("image"), uploadController.uploadFoodImage);
router.post( "/restaurant-logo", restaurantUpload.single("image"), uploadController.uploadRestaurantLogo);
router.post( "/customer-avatar", customerAuth, customerAvatarUpload.single("image"), uploadController.uploadCustomerAvatar);

module.exports = router;