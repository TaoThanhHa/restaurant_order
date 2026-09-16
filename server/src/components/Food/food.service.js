const prisma = require("../../config/prisma");

const checkRestaurant = user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");
    if (!user.restaurantId) throw new Error("Tài khoản chưa được gán nhà hàng.");
    return Number(user.restaurantId);
};

const getRestaurant = async (restaurantId, tx = prisma) => {
    const restaurant = await tx.restaurant.findUnique({
        where: { id: restaurantId },
        select: { id: true, mode: true },
    });

    if (!restaurant) throw new Error("Nhà hàng không tồn tại.");

    return restaurant;
};

const checkBranchAccess = async (branchId, user, tx = prisma) => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    const branch = await tx.branch.findUnique({
        where: { id: Number(branchId) },
        select: { id: true, restaurantId: true },
    });

    if (!branch) throw new Error("Chi nhánh không tồn tại.");

    if (user.role === "ADMIN") {
        if (Number(branch.restaurantId) !== Number(user.restaurantId)) {
            throw new Error("Bạn không có quyền truy cập chi nhánh này.");
        }
    } else if (Number(branch.id) !== Number(user.branchId)) {
        throw new Error("Bạn không có quyền truy cập chi nhánh này.");
    }

    return branch;
};

const getFoodByRestaurant = async (id, restaurantId) => {
    return await prisma.food.findFirst({
        where: {
            id: Number(id),
            restaurantId,
        },
        include: {
            category: true,
            branchFoods: {
                include: { branch: true },
            },
        },
    });
};

const getAll = async user => {
    const restaurantId = checkRestaurant(user);

    return await prisma.food.findMany({
        where: { restaurantId },
        include: {
            category: true,
            branchFoods: {
                include: { branch: true },
            },
        },
        orderBy: { id: "asc" },
    });
};

const getById = async (id, user) => {
    const restaurantId = checkRestaurant(user);

    const food = await getFoodByRestaurant(id, restaurantId);

    if (!food) throw new Error("Món ăn không tồn tại.");

    return food;
};

const create = async (data, user) => {
    const restaurantId = checkRestaurant(user);
    const restaurant = await getRestaurant(restaurantId);

    const categoryId = Number(data.categoryId);
    const name = data.name?.trim();
    const price = data.price;
    const description = data.description?.trim();
    const image = data.image;

    if (!name) throw new Error("Tên món ăn không được để trống.");
    if (!data.categoryId) throw new Error("Danh mục không được để trống.");
    if (price === undefined || Number(price) <= 0) {
        throw new Error("Giá phải lớn hơn 0.");
    }

    const category = await prisma.category.findFirst({
        where: {
            id: categoryId,
            restaurantId,
        },
    });

    if (!category) throw new Error("Danh mục không tồn tại.");

    const branchIds = [
        ...new Set((data.branchIds || []).map(Number)),
    ];

    if (restaurant.mode === "MULTI" && branchIds.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một chi nhánh.");
    }

    if (restaurant.mode === "SINGLE" && branchIds.length > 0) {
        throw new Error("Nhà hàng đơn chi nhánh không cần chọn chi nhánh.");
    }

    if (branchIds.length > 0) {
        const branches = await prisma.branch.findMany({
            where: {
                id: { in: branchIds },
                restaurantId,
            },
            select: { id: true },
        });

        if (branches.length !== branchIds.length) {
            throw new Error("Có chi nhánh không thuộc nhà hàng của bạn.");
        }
    }

    const existed = await prisma.food.findFirst({
        where: {
            restaurantId,
            categoryId,
            name,
        },
    });

    if (existed) throw new Error("Món ăn đã tồn tại.");

    return await prisma.$transaction(async tx => {
        const food = await tx.food.create({
            data: {
                restaurantId,
                categoryId,
                name,
                price: Number(price),
                description,
                image,
            },
        });

        if (branchIds.length > 0) {
            await tx.branchFood.createMany({
                data: branchIds.map(branchId => ({
                    branchId,
                    foodId: food.id,
                    status: "AVAILABLE",
                })),
            });
        }

        return await tx.food.findUnique({
            where: { id: food.id },
            include: {
                category: true,
                branchFoods: {
                    include: { branch: true },
                },
            },
        });
    });
};

const update = async (id, data, user) => {
    const restaurantId = checkRestaurant(user);
    const restaurant = await getRestaurant(restaurantId);

    const food = await prisma.food.findFirst({
        where: {
            id: Number(id),
            restaurantId,
        },
        include: {
            branchFoods: true,
        },
    });

    if (!food) throw new Error("Món ăn không tồn tại.");

    if (data.categoryId !== undefined) {
        const category = await prisma.category.findFirst({
            where: {
                id: Number(data.categoryId),
                restaurantId,
            },
        });

        if (!category) throw new Error("Danh mục không tồn tại.");
    }

    const newName = data.name?.trim();
    const newCategoryId = Number(
        data.categoryId ?? food.categoryId
    );

    if (newName) {
        const existed = await prisma.food.findFirst({
            where: {
                restaurantId,
                name: newName,
                categoryId: newCategoryId,
                NOT: { id: Number(id) },
            },
        });

        if (existed) throw new Error("Tên món đã tồn tại.");
    }

    return await prisma.$transaction(async tx => {
        if (restaurant.mode === "MULTI" && Array.isArray(data.branchFoods)) {
            const branchFoods = data.branchFoods
                .filter(item => item?.branchId)
                .map(item => ({
                    branchId: Number(item.branchId),
                    status: item.status || "AVAILABLE",
                }));

            const newBranchIds = [
                ...new Set(branchFoods.map(item => item.branchId)),
            ];

            if (newBranchIds.length === 0) {
                throw new Error("Vui lòng chọn ít nhất một chi nhánh.");
            }

            const branches = await tx.branch.findMany({
                where: {
                    id: { in: newBranchIds },
                    restaurantId,
                },
                select: { id: true },
            });

            if (branches.length !== newBranchIds.length) {
                throw new Error("Có chi nhánh không thuộc nhà hàng của bạn.");
            }

            const oldBranchIds = food.branchFoods.map(
                item => item.branchId
            );

            const removeIds = oldBranchIds.filter(
                branchId => !newBranchIds.includes(branchId)
            );

            if (removeIds.length > 0) {
                await tx.branchFood.deleteMany({
                    where: {
                        foodId: Number(id),
                        branchId: { in: removeIds },
                    },
                });
            }

            for (const branchFood of branchFoods) {
                await tx.branchFood.upsert({
                    where: {
                        branchId_foodId: {
                            branchId: branchFood.branchId,
                            foodId: Number(id),
                        },
                    },
                    update: {
                        status: branchFood.status,
                    },
                    create: {
                        foodId: Number(id),
                        branchId: branchFood.branchId,
                        status: branchFood.status,
                    },
                });
            }
        }

        await tx.food.update({
            where: { id: Number(id) },
            data: {
                name: newName ?? food.name,
                category:
                    data.categoryId !== undefined
                        ? {
                              connect: {
                                  id: Number(data.categoryId),
                              },
                          }
                        : undefined,
                price:
                    data.price !== undefined
                        ? Number(data.price)
                        : food.price,
                description:
                    data.description !== undefined
                        ? data.description?.trim() || null
                        : food.description,
                image:
                    data.image !== undefined
                        ? data.image
                        : food.image,
            },
        });

        return await tx.food.findUnique({
            where: { id: Number(id) },
            include: {
                category: true,
                branchFoods: {
                    include: { branch: true },
                },
            },
        });
    });
};

const remove = async (id, user) => {
    const restaurantId = checkRestaurant(user);

    const food = await prisma.food.findFirst({
        where: {
            id: Number(id),
            restaurantId,
        },
        include: {
            orderItems: true,
            branchFoods: true,
        },
    });

    if (!food) throw new Error("Món ăn không tồn tại.");

    if (food.orderItems.length > 0) {
        throw new Error("Món ăn đã có trong đơn hàng, không thể xóa.");
    }

    await prisma.$transaction(async tx => {
        if (food.branchFoods.length > 0) {
            await tx.branchFood.deleteMany({
                where: { foodId: Number(id) },
            });
        }

        await tx.food.delete({
            where: { id: Number(id) },
        });
    });
};

const getByBranch = async (branchId, user) => {
    if (!branchId) throw new Error("Chi nhánh không hợp lệ.");

    await checkBranchAccess(branchId, user);

    return await prisma.branchFood.findMany({
        where: {
            branchId: Number(branchId),
            status: { not: "INACTIVE" },
        },
        include: {
            food: {
                include: {
                    category: true,
                },
            },
        },
        orderBy: {
            food: {
                name: "asc",
            },
        },
    });
};

const getByQrCode = async qrCode => {
    const table = await prisma.table.findUnique({
        where: { qrCode },
        include: {
            floor: {
                include: {
                    branch: {
                        select: {
                            id: true,
                            restaurantId: true,
                            restaurant: {
                                select: {
                                    mode: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!table) throw new Error("Bàn không tồn tại.");

    const branch = table.floor.branch;
    const restaurantId = branch.restaurantId;

    if (branch.restaurant?.mode === "SINGLE") {
        return await prisma.food.findMany({
            where: {
                restaurantId,
            },
            include: {
                category: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    return await prisma.branchFood.findMany({
        where: {
            branchId: branch.id,
            status: { not: "INACTIVE" },
        },
        include: {
            food: {
                include: {
                    category: true,
                },
            },
        },
        orderBy: {
            food: {
                name: "asc",
            },
        },
    });
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getByBranch,
    getByQrCode,
};

