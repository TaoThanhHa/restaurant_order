const prisma = require("../../config/prisma");

const getPublicInfo = async (restaurantId) => {
    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: Number(restaurantId),
        },
        select: {
            name: true,
            logo: true,
            theme: true,
        },
    });

    if (!restaurant) {
        throw new Error("Không tìm thấy thông tin nhà hàng.");
    }

    return restaurant;
};

module.exports = {
    getPublicInfo,
};