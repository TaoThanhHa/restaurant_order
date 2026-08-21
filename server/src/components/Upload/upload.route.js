const express = require("express");

const router = express.Router();

const {
    foodUpload,
    restaurantUpload,
} = require("../../middlewares/upload.middleware");

const uploadController = require("./upload.controller");



// UPLOAD FOOD


router.post(
    "/food",
    foodUpload.single("image"),
    uploadController.uploadFoodImage
);



// UPLOAD RESTAURANT LOGO


router.post(
    "/restaurant-logo",
    restaurantUpload.single("image"),
    uploadController.uploadRestaurantLogo
);


module.exports = router;