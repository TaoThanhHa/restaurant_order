const prisma = require("../../config/prisma");

const checkRestaurant = user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");
    if (!user.restaurantId) throw new Error("Tài khoản chưa được gán nhà hàng.");
    return Number(user.restaurantId);
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

    if (branchIds.length === 0) {
        throw new Error("Món ăn phải thuộc ít nhất một chi nhánh.");
    }

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

        await tx.branchFood.createMany({
            data: branchIds.map(branchId => {
                const branchFood = data.branchFoods?.find(
                    item => Number(item.branchId) === branchId
                );

                return {
                    branchId,
                    foodId: food.id,
                    status: branchFood?.status || "AVAILABLE",
                };
            }),
        });

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
        if (Array.isArray(data.branchFoods)) {
            const branchFoods = data.branchFoods
                .filter(
                    item =>
                        item?.branchId !== undefined &&
                        item?.branchId !== null
                )
                .map(item => ({
                    branchId: Number(item.branchId),
                    status: item.status || "AVAILABLE",
                }));

            if (
                branchFoods.some(
                    item => !Number.isInteger(item.branchId)
                )
            ) {
                throw new Error("ID chi nhánh không hợp lệ.");
            }

            const newBranchIds = [
                ...new Set(
                    branchFoods.map(item => item.branchId)
                ),
            ];

            if (newBranchIds.length === 0) {
                throw new Error(
                    "Món ăn phải thuộc ít nhất một chi nhánh."
                );
            }

            const branches = await tx.branch.findMany({
                where: {
                    id: { in: newBranchIds },
                    restaurantId,
                },
                select: {
                    id: true,
                    restaurantId: true,
                },
            });

            console.log("===== DEBUG UPDATE FOOD =====");
            console.log("user.restaurantId:", user.restaurantId);
            console.log("restaurantId:", restaurantId);
            console.log("newBranchIds:", newBranchIds);
            console.log("branches:", branches);
            console.log("=============================");

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
        throw new Error(
            "Món ăn đã có trong đơn hàng, không thể xóa."
        );
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
    const restaurantId = checkRestaurant(user);

    if (user?.role === "ADMIN" && !branchId) {
        const branches = await prisma.branch.findMany({
            where: { restaurantId },
            select: { id: true },
            orderBy: { id: "asc" },
        });

        if (!branches.length) {
            throw new Error("Nhà hàng chưa có chi nhánh.");
        }

        if (branches.length > 1) {
            throw new Error("Vui lòng chọn chi nhánh.");
        }

        branchId = branches[0].id;
    }

    if (!branchId) throw new Error("Chi nhánh không hợp lệ.");

    const branch = await checkBranchAccess(branchId, user);

    return await prisma.branchFood.findMany({
        where: {
            branchId: branch.id,
            status: { not: "INACTIVE" },
            food: {
                restaurantId,
            },
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
                        },
                    },
                },
            },
        },
    });

    if (!table) throw new Error("Bàn không tồn tại.");

    const branch = table.floor.branch;

    return await prisma.branchFood.findMany({
        where: {
            branchId: branch.id,
            status: "AVAILABLE",
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
