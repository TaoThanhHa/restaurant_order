const prisma = require("../../config/prisma");

const getPublicInfo = async () => {

    const restaurant =
        await prisma.restaurant.findFirst({
            select: {
                name: true,
                logo: true,
            },
        });

    if (!restaurant) {
        throw new Error(
            "Không tìm thấy thông tin nhà hàng."
        );
    }

    return restaurant;
};

module.exports = {
    getPublicInfo,
};