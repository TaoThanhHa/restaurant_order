const response = require("../../utils/response");


// ========================================
// UPLOAD FOOD IMAGE
// ========================================

const uploadFoodImage = async (
    req,
    res
) => {
    try {
        if (!req.file) {
            return response.error(
                res,
                "Vui lòng chọn ảnh.",
                400
            );
        }

        const imageUrl = `/uploads/foods/${req.file.filename}`;

        return response.success(
            res,
            "Upload ảnh món ăn thành công.",
            imageUrl
        );

    } catch (error) {
        console.error(
            "UPLOAD FOOD IMAGE ERROR:",
            error
        );
        return response.error(
            res,
            error.message,
            400
        );
    }
};


// ========================================
// UPLOAD RESTAURANT LOGO
// ========================================

const uploadRestaurantLogo = async (
    req,
    res
) => {

    try {
        if (!req.file) {
            return response.error(
                res,
                "Vui lòng chọn ảnh.",
                400
            );
        }

        const imageUrl = `/uploads/restaurants/${req.file.filename}`;
        return response.success(
            res,
            "Upload logo thành công.",
            imageUrl
        );
    } catch (error) {
        console.error(
            "UPLOAD RESTAURANT LOGO ERROR:",
            error
        );

        return response.error(
            res,
            error.message,
            400
        );
    }
};

module.exports = {
    uploadFoodImage,
    uploadRestaurantLogo,
};