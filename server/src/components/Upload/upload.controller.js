const prisma = require("../../config/prisma");
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

const uploadCustomerAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return response.error(
                res,
                "Vui lòng chọn ảnh.",
                400
            );
        }

        const customerId = req.customer?.id;

        if (!customerId) {
            return response.error(
                res,
                "Không xác định được khách hàng.",
                401
            );
        }

        const avatar =
            `/uploads/customers/${req.file.filename}`;

        const customer =
            await prisma.customer.update({
                where: {
                    id: customerId,
                },
                data: {
                    avatar,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                },
            });

        return response.success(
            res,
            "Cập nhật ảnh đại diện thành công.",
            customer
        );

    } catch (error) {
        console.error(
            "UPLOAD CUSTOMER AVATAR ERROR:",
            error
        );

        return response.error(
            res,
            error.message ||
                "Không thể cập nhật ảnh đại diện.",
            400
        );
    }
};


module.exports = {

    uploadFoodImage,
    uploadRestaurantLogo,
    uploadCustomerAvatar,

};