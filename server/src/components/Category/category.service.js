const prisma = require("../../config/prisma");

const checkRestaurantAccess = user => {
    const restaurantId = Number(user?.restaurantId);
    if (!restaurantId) throw new Error("Tài khoản chưa thuộc nhà hàng.");
    return restaurantId;
};

const getAll = async user => {
    const restaurantId = checkRestaurantAccess(user);

    return await prisma.category.findMany({
        where: { restaurantId },
        include: {
            _count: {
                select: { foods: true }
            }
        },
        orderBy: { id: "asc" }
    });
};

const getById = async (id, user) => {
    const restaurantId = checkRestaurantAccess(user);

    const category = await prisma.category.findFirst({
        where: {
            id: Number(id),
            restaurantId
        },
        include: { foods: true }
    });

    if (!category) throw new Error("Danh mục không tồn tại.");

    return category;
};

const create = async (data, user) => {
    const restaurantId = checkRestaurantAccess(user);
    const name = data.name?.trim();
    const description = data.description?.trim() || null;

    if (!name) throw new Error("Tên danh mục không được để trống.");

    const exists = await prisma.category.findFirst({
        where: { restaurantId, name }
    });

    if (exists) throw new Error("Danh mục đã tồn tại.");

    return await prisma.category.create({
        data: {
            restaurantId,
            name,
            description
        }
    });
};

const update = async (id, data, user) => {
    const restaurantId = checkRestaurantAccess(user);

    const category = await prisma.category.findFirst({
        where: {
            id: Number(id),
            restaurantId
        }
    });

    if (!category) throw new Error("Danh mục không tồn tại.");

    const updateData = {};

    if (data.name !== undefined) {
        const name = data.name.trim();

        if (!name) throw new Error("Tên danh mục không được để trống.");

        const exists = await prisma.category.findFirst({
            where: {
                restaurantId,
                name,
                NOT: { id: Number(id) }
            }
        });

        if (exists) throw new Error("Tên danh mục đã tồn tại.");

        updateData.name = name;
    }

    if (data.description !== undefined) {
        updateData.description = data.description?.trim() || null;
    }

    return await prisma.category.update({
        where: { id: Number(id) },
        data: updateData
    });
};

const remove = async (id, user) => {
    const restaurantId = checkRestaurantAccess(user);

    const category = await prisma.category.findFirst({
        where: {
            id: Number(id),
            restaurantId
        },
        include: { foods: true }
    });

    if (!category) throw new Error("Danh mục không tồn tại.");

    if (category.foods.length > 0) {
        throw new Error("Danh mục đang có món ăn, không thể xóa.");
    }

    await prisma.category.delete({
        where: { id: Number(id) }
    });
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
