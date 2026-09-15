const prisma = require("../../config/prisma");

const checkRestaurant = user => {
    if (!user) {
        throw new Error("Chưa xác thực người dùng.");
    }

    if (!user.restaurantId) {
        throw new Error("Tài khoản chưa được gán nhà hàng.");
    }

    return Number(user.restaurantId);
};

const checkBranchAccess = async (branchId, user, tx = prisma) => {
    if (!user) {
        throw new Error("Chưa xác thực người dùng.");
    }

    const branch = await tx.branch.findUnique({
        where: {
            id: Number(branchId),
        },
        select: {
            id: true,
            restaurantId: true,
        },
    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

    if (user.role === "ADMIN") {
        if (
            Number(branch.restaurantId) !==
            Number(user.restaurantId)
        ) {
            throw new Error(
                "Bạn không có quyền truy cập chi nhánh này."
            );
        }
    } else {
        if (
            Number(branch.id) !==
            Number(user.branchId)
        ) {
            throw new Error(
                "Bạn không có quyền truy cập chi nhánh này."
            );
        }
    }

    return branch;
};

const getFoodByRestaurant = async (id, restaurantId) => {
    return await prisma.food.findFirst({
        where: {
            id: Number(id),
            branchFoods: {
                some: {
                    branch: {
                        restaurantId,
                    },
                },
            },
        },
        include: {
            category: true,
            branchFoods: {
                include: {
                    branch: true,
                },
            },
        },
    });
};

const getAll = async user => {
    const restaurantId = checkRestaurant(user);

    return await prisma.food.findMany({
        where: {
            branchFoods: {
                some: {
                    branch: {
                        restaurantId,
                    },
                },
            },
        },
        include: {
            category: true,
            branchFoods: {
                include: {
                    branch: true,
                },
            },
        },
        orderBy: {
            id: "asc",
        },
    });
};

const getById = async (id, user) => {
    const restaurantId = checkRestaurant(user);

    const food = await getFoodByRestaurant(
        id,
        restaurantId
    );

    if (!food) {
        throw new Error("Món ăn không tồn tại.");
    }

    return food;
};

const create = async (data, user) => {
    const restaurantId = checkRestaurant(user);

    const categoryId = data.categoryId;
    const name = data.name?.trim();
    const price = data.price;
    const description = data.description?.trim();
    const image = data.image;

    if (!name) {
        throw new Error("Tên món ăn không được để trống.");
    }

    if (categoryId === undefined) {
        throw new Error("Danh mục không được để trống.");
    }

    if (price === undefined || Number(price) <= 0) {
        throw new Error("Giá phải lớn hơn 0.");
    }

    const category = await prisma.category.findUnique({
        where: {
            id: Number(categoryId),
        },
    });

    if (!category) {
        throw new Error("Danh mục không tồn tại.");
    }

    const existed = await prisma.food.findFirst({
        where: {
            categoryId: Number(categoryId),
            name,
            branchFoods: {
                some: {
                    branch: {
                        restaurantId,
                    },
                },
            },
        },
    });

    if (existed) {
        throw new Error("Món ăn đã tồn tại.");
    }

    const branchIds = [
        ...new Set(
            (data.branchIds || []).map(Number)
        ),
    ];

    if (branchIds.length === 0) {
        throw new Error(
            "Vui lòng chọn ít nhất một chi nhánh."
        );
    }

    const branches = await prisma.branch.findMany({
        where: {
            id: {
                in: branchIds,
            },
            restaurantId,
        },
        select: {
            id: true,
        },
    });

    if (branches.length !== branchIds.length) {
        throw new Error(
            "Có chi nhánh không thuộc nhà hàng của bạn."
        );
    }

    return await prisma.$transaction(async tx => {
        const food = await tx.food.create({
            data: {
                categoryId: Number(categoryId),
                name,
                price: Number(price),
                description,
                image,
            },
        });

        await tx.branchFood.createMany({
            data: branchIds.map(branchId => ({
                branchId,
                foodId: food.id,
                status: "AVAILABLE",
            })),
        });

        return await tx.food.findUnique({
            where: {
                id: food.id,
            },
            include: {
                category: true,
                branchFoods: {
                    include: {
                        branch: true,
                    },
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
            branchFoods: {
                some: {
                    branch: {
                        restaurantId,
                    },
                },
            },
        },
        include: {
            branchFoods: true,
        },
    });

    if (!food) {
        throw new Error("Món ăn không tồn tại.");
    }

    if (data.categoryId !== undefined) {
        const category =
            await prisma.category.findUnique({
                where: {
                    id: Number(data.categoryId),
                },
            });

        if (!category) {
            throw new Error(
                "Danh mục không tồn tại."
            );
        }
    }

    const newName = data.name?.trim();

    if (newName) {
        const existed =
            await prisma.food.findFirst({
                where: {
                    name: newName,
                    categoryId: Number(
                        data.categoryId ??
                            food.categoryId
                    ),
                    NOT: {
                        id: Number(id),
                    },
                    branchFoods: {
                        some: {
                            branch: {
                                restaurantId,
                            },
                        },
                    },
                },
            });

        if (existed) {
            throw new Error(
                "Tên món đã tồn tại."
            );
        }
    }

    return await prisma.$transaction(
        async tx => {
            if (Array.isArray(data.branchFoods)) {
                const branchFoods = data.branchFoods
                    .filter(
                        item =>
                            item &&
                            item.branchId
                    )
                    .map(item => ({
                        branchId: Number(
                            item.branchId
                        ),
                        status:
                            item.status ||
                            "AVAILABLE",
                    }));

                const newBranchIds = [
                    ...new Set(
                        branchFoods.map(
                            item =>
                                item.branchId
                        )
                    ),
                ];

                if (
                    newBranchIds.length === 0
                ) {
                    throw new Error(
                        "Vui lòng chọn ít nhất một chi nhánh."
                    );
                }

                const branches =
                    await tx.branch.findMany({
                        where: {
                            id: {
                                in: newBranchIds,
                            },
                            restaurantId,
                        },
                        select: {
                            id: true,
                        },
                    });

                if (
                    branches.length !==
                    newBranchIds.length
                ) {
                    throw new Error(
                        "Có chi nhánh không thuộc nhà hàng của bạn."
                    );
                }

                const oldBranchIds =
                    food.branchFoods.map(
                        item =>
                            item.branchId
                    );

                const removeIds =
                    oldBranchIds.filter(
                        branchId =>
                            !newBranchIds.includes(
                                branchId
                            )
                    );

                if (
                    removeIds.length > 0
                ) {
                    await tx.branchFood.deleteMany(
                        {
                            where: {
                                foodId: Number(
                                    id
                                ),
                                branchId: {
                                    in: removeIds,
                                },
                            },
                        }
                    );
                }

                for (
                    const branchFood of branchFoods
                ) {
                    await tx.branchFood.upsert({
                        where: {
                            branchId_foodId: {
                                branchId:
                                    branchFood.branchId,
                                foodId:
                                    Number(id),
                            },
                        },
                        update: {
                            status:
                                branchFood.status,
                        },
                        create: {
                            foodId:
                                Number(id),
                            branchId:
                                branchFood.branchId,
                            status:
                                branchFood.status,
                        },
                    });
                }
            }

            await tx.food.update({
                where: {
                    id: Number(id),
                },
                data: {
                    name:
                        newName ??
                        food.name,

                    category:
                        data.categoryId !==
                        undefined
                            ? {
                                  connect: {
                                      id: Number(
                                          data.categoryId
                                      ),
                                  },
                              }
                            : undefined,

                    price:
                        data.price !==
                        undefined
                            ? Number(
                                  data.price
                              )
                            : food.price,

                    description:
                        data.description !==
                        undefined
                            ? data.description
                            : food.description,

                    image:
                        data.image !==
                        undefined
                            ? data.image
                            : food.image,
                },
            });

            return await tx.food.findUnique({
                where: {
                    id: Number(id),
                },
                include: {
                    category: true,
                    branchFoods: {
                        include: {
                            branch: true,
                        },
                    },
                },
            });
        }
    );
};

const remove = async (id, user) => {
    const restaurantId = checkRestaurant(user);

    const food = await prisma.food.findFirst({
        where: {
            id: Number(id),
            branchFoods: {
                some: {
                    branch: {
                        restaurantId,
                    },
                },
            },
        },
        include: {
            orderItems: true,
            branchFoods: true,
        },
    });

    if (!food) {
        throw new Error("Món ăn không tồn tại.");
    }

    if (food.orderItems.length > 0) {
        throw new Error(
            "Món ăn đã có trong đơn hàng, không thể xóa."
        );
    }

    await prisma.$transaction(
        async tx => {
            if (food.branchFoods.length > 0) {
                await tx.branchFood.deleteMany({
                    where: {
                        foodId: Number(id),
                    },
                });
            }

            await tx.food.delete({
                where: {
                    id: Number(id),
                },
            });
        }
    );
};

const getByBranch = async (
    branchId,
    user
) => {
    if (!branchId) {
        throw new Error(
            "Chi nhánh không hợp lệ."
        );
    }

    await checkBranchAccess(
        branchId,
        user
    );

    return await prisma.branchFood.findMany({
        where: {
            branchId: Number(branchId),
            status: {
                not: "INACTIVE",
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
        where: {
            qrCode,
        },
        include: {
            floor: true,
        },
    });

    if (!table) {
        throw new Error("Bàn không tồn tại.");
    }

    return await prisma.branchFood.findMany({
        where: {
            branchId:
                table.floor.branchId,
            status: {
                not: "INACTIVE",
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

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getByBranch,
    getByQrCode,
};