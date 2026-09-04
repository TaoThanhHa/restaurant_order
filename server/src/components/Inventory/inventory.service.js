const prisma = require("../../config/prisma");

const VALID_UNITS = [
    "KG",
    "G",
    "L",
    "ML",
    "PIECE",
    "PACK",
];

// ========================================
// GET ALL INGREDIENTS
// ========================================

const getAllIngredients = async (branchId) => {
    branchId = Number(branchId);

    if (!Number.isInteger(branchId) || branchId <= 0) {
        throw new Error("Chi nhánh không hợp lệ.");
    }

    const branch = await prisma.branch.findUnique({
        where: {
            id: branchId,
        },
    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

    const ingredients = await prisma.ingredient.findMany({
        where: {
            isActive: true,
        },
        include: {
            branchIngredients: {
                where: {
                    branchId,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });

    return ingredients.map((ingredient) => {
        const inventory = ingredient.branchIngredients[0];

        return {
            id: ingredient.id,
            name: ingredient.name,
            unit: ingredient.unit,
            description: ingredient.description,
            isActive: ingredient.isActive,

            stockQuantity: inventory
                ? Number(inventory.quantity)
                : 0,

            minQuantity: inventory
                ? Number(inventory.minQuantity)
                : 0,

            branchIngredientId:
                inventory?.id || null,

            updatedAt:
                inventory?.updatedAt || null,
        };
    });
};

// ========================================
// GET INGREDIENT BY ID
// ========================================

const getIngredientById = async (id) => {

    const ingredient =
        await prisma.ingredient.findUnique({
            where: {
                id: Number(id),
            },
        });

    if (!ingredient) {
        throw new Error(
            "Nguyên liệu không tồn tại."
        );
    }

    return ingredient;
};

// ========================================
// CREATE INGREDIENT
// ========================================

const createIngredient = async (data) => {

    const name =
        data.name?.trim();

    const unit =
        data.unit?.trim();

    if (!name) {
        throw new Error(
            "Vui lòng nhập tên nguyên liệu."
        );
    }

    if (!unit) {
        throw new Error(
            "Vui lòng chọn đơn vị."
        );
    }

    if (!VALID_UNITS.includes(unit)) {
        throw new Error(
            "Đơn vị nguyên liệu không hợp lệ."
        );
    }

    const existed =
        await prisma.ingredient.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });

    if (existed) {
        throw new Error(
            "Nguyên liệu đã tồn tại."
        );
    }

    return await prisma.ingredient.create({
        data: {
            name,
            unit,
            description:
                data.description?.trim() || null,
        },
    });
};

// ========================================
// UPDATE INGREDIENT
// ========================================

const updateIngredient = async (
    id,
    data
) => {

    id = Number(id);

    const ingredient =
        await prisma.ingredient.findUnique({
            where: {
                id,
            },
        });

    if (!ingredient) {
        throw new Error(
            "Nguyên liệu không tồn tại."
        );
    }

    const name =
        data.name?.trim();

    const unit =
        data.unit?.trim();

    if (!name) {
        throw new Error(
            "Vui lòng nhập tên nguyên liệu."
        );
    }

    if (!unit) {
        throw new Error(
            "Vui lòng chọn đơn vị."
        );
    }

    if (!VALID_UNITS.includes(unit)) {
        throw new Error(
            "Đơn vị nguyên liệu không hợp lệ."
        );
    }

    const existed =
        await prisma.ingredient.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },

                id: {
                    not: id,
                },
            },
        });

    if (existed) {
        throw new Error(
            "Tên nguyên liệu đã được sử dụng."
        );
    }

    return await prisma.ingredient.update({
        where: {
            id,
        },

        data: {
            name,
            unit,
            description:
                data.description?.trim() || null,
        },
    });
};

// ========================================
// TOGGLE STATUS
// ========================================

const toggleStatus = async (id) => {

    id = Number(id);

    const ingredient =
        await prisma.ingredient.findUnique({
            where: {
                id,
            },
        });

    if (!ingredient) {
        throw new Error(
            "Nguyên liệu không tồn tại."
        );
    }

    return await prisma.ingredient.update({
        where: {
            id,
        },

        data: {
            isActive:
                !ingredient.isActive,
        },
    });
};

// ========================================
// IMPORT INVENTORY
// ========================================

const importInventory = async (
    branchId,
    ingredientId,
    quantity,
    note
) => {

    branchId =
        Number(branchId);

    ingredientId =
        Number(ingredientId);

    quantity =
        Number(quantity);

    if (
        !Number.isInteger(branchId) ||
        branchId <= 0
    ) {
        throw new Error(
            "Chi nhánh không hợp lệ."
        );
    }

    if (
        !Number.isInteger(ingredientId) ||
        ingredientId <= 0
    ) {
        throw new Error(
            "Nguyên liệu không hợp lệ."
        );
    }

    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        throw new Error(
            "Số lượng nhập phải lớn hơn 0."
        );
    }

    const [
        branch,
        ingredient,
    ] =
        await Promise.all([

            prisma.branch.findUnique({
                where: {
                    id: branchId,
                },
            }),

            prisma.ingredient.findUnique({
                where: {
                    id: ingredientId,
                },
            }),

        ]);

    if (!branch) {
        throw new Error(
            "Chi nhánh không tồn tại."
        );
    }

    if (!ingredient) {
        throw new Error(
            "Nguyên liệu không tồn tại."
        );
    }

    if (!ingredient.isActive) {
        throw new Error(
            "Nguyên liệu đã ngừng sử dụng."
        );
    }

    return await prisma.$transaction(
        async (tx) => {

            const inventory =
                await tx.branchIngredient.upsert({

                    where: {
                        branchId_ingredientId: {
                            branchId,
                            ingredientId,
                        },
                    },

                    create: {
                        branchId,
                        ingredientId,
                        quantity,
                    },

                    update: {
                        quantity: {
                            increment: quantity,
                        },
                    },

                    include: {
                        ingredient: true,
                    },
                });

            await tx.inventoryTransaction.create({
                data: {
                    branchId,
                    ingredientId,
                    type: "IMPORT",
                    quantity,
                    note:
                        note?.trim() ||
                        "Nhập kho",
                },
            });

            return inventory;
        }
    );
};

// ========================================
// GET INVENTORY BY BRANCH
// ========================================

const getInventoryByBranch = async (branchId) => {
    branchId = Number(branchId);

    if (!Number.isInteger(branchId) || branchId <= 0) {
        throw new Error("Chi nhánh không hợp lệ.");
    }

    const branch = await prisma.branch.findUnique({
        where: {
            id: branchId,
        },
    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

    return await prisma.branchIngredient.findMany({
        where: {
            branchId,
            ingredient: {
                isActive: true,
            },
        },
        include: {
            ingredient: true,
        },
        orderBy: {
            ingredient: {
                name: "asc",
            },
        },
    });
};

// ========================================
// EXPORT INVENTORY
// ========================================

const exportInventory = async (
    branchId,
    ingredientId,
    quantity,
    note
) => {
    branchId = Number(branchId);
    ingredientId = Number(ingredientId);
    quantity = Number(quantity);

    if (!Number.isInteger(branchId) || branchId <= 0) {
        throw new Error("Chi nhánh không hợp lệ.");
    }

    if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
        throw new Error("Nguyên liệu không hợp lệ.");
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(
            "Số lượng xuất phải lớn hơn 0."
        );
    }

    const inventory =
        await prisma.branchIngredient.findUnique({
            where: {
                branchId_ingredientId: {
                    branchId,
                    ingredientId,
                },
            },
            include: {
                ingredient: true,
            },
        });

    if (!inventory) {
        throw new Error(
            "Nguyên liệu chưa có trong kho."
        );
    }

    if (Number(inventory.quantity) < quantity) {
        throw new Error(
            `Tồn kho không đủ. Hiện còn ${inventory.quantity} ${inventory.ingredient.unit}.`
        );
    }

    return await prisma.$transaction(
        async (tx) => {

            const updated =
                await tx.branchIngredient.update({
                    where: {
                        id: inventory.id,
                    },

                    data: {
                        quantity: {
                            decrement: quantity,
                        },
                    },

                    include: {
                        ingredient: true,
                    },
                });

            await tx.inventoryTransaction.create({
                data: {
                    branchId,
                    ingredientId,
                    type: "EXPORT",
                    quantity,
                    note:
                        note?.trim() ||
                        "Xuất kho",
                },
            });

            return updated;
        }
    );
};

// ========================================
// ADJUST INVENTORY
// ========================================

const adjustInventory = async (
    branchId,
    ingredientId,
    actualQuantity,
    note
) => {
    branchId = Number(branchId);
    ingredientId = Number(ingredientId);
    actualQuantity = Number(actualQuantity);

    if (!Number.isInteger(branchId) || branchId <= 0) {
        throw new Error("Chi nhánh không hợp lệ.");
    }

    if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
        throw new Error("Nguyên liệu không hợp lệ.");
    }

    if (
        !Number.isFinite(actualQuantity) ||
        actualQuantity < 0
    ) {
        throw new Error(
            "Số lượng tồn thực tế không hợp lệ."
        );
    }

    const inventory =
        await prisma.branchIngredient.findUnique({
            where: {
                branchId_ingredientId: {
                    branchId,
                    ingredientId,
                },
            },
            include: {
                ingredient: true,
            },
        });

    if (!inventory) {
        throw new Error(
            "Nguyên liệu chưa có trong kho."
        );
    }

    const difference =
        actualQuantity -
        Number(inventory.quantity);

    return await prisma.$transaction(
        async (tx) => {

            const updated =
                await tx.branchIngredient.update({
                    where: {
                        id: inventory.id,
                    },

                    data: {
                        quantity: actualQuantity,
                    },

                    include: {
                        ingredient: true,
                    },
                });

            await tx.inventoryTransaction.create({
                data: {
                    branchId,
                    ingredientId,

                    type: "ADJUSTMENT",

                    quantity: Math.abs(
                        difference
                    ),

                    note:
                        note?.trim() ||
                        `Kiểm kho: ${
                            difference >= 0
                                ? "tăng"
                                : "giảm"
                        } ${Math.abs(difference)}`,
                },
            });

            return updated;
        }
    );
};

// ========================================
// GET INVENTORY TRANSACTIONS
// ========================================

const getInventoryTransactions = async (
    branchId,
    ingredientId
) => {
    branchId = Number(branchId);

    const where = {
        branchId,
    };

    if (ingredientId) {
        where.ingredientId =
            Number(ingredientId);
    }

    return await prisma.inventoryTransaction.findMany({
        where,

        include: {
            ingredient: true,
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};

module.exports = {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    toggleStatus,
    importInventory,
    getInventoryByBranch,
    exportInventory,
    adjustInventory,
    getInventoryTransactions,
};