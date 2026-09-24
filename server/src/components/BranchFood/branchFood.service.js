const prisma = require("../../config/prisma");

const checkBranchAccess = async (branchId, user) => {
    if (!user) throw new Error("Chưa xác thực người dùng.");
    if (!user.restaurantId) throw new Error("Tài khoản chưa được gán nhà hàng.");

    const branch = await prisma.branch.findUnique({
        where: { id: Number(branchId) },
        select: { id: true, restaurantId: true },
    });

    if (!branch) throw new Error("Chi nhánh không tồn tại.");

    if (Number(branch.restaurantId) !== Number(user.restaurantId)) {
        throw new Error("Bạn không có quyền truy cập chi nhánh này.");
    }

    if (user.role !== "ADMIN" && Number(branch.id) !== Number(user.branchId)) {
        throw new Error("Bạn không có quyền truy cập chi nhánh này.");
    }

    return branch;
};

const getAll = async (branchId, user) => {
    const branch = await checkBranchAccess(branchId, user);

    return await prisma.branchFood.findMany({
        where: {
            branchId: branch.id,
            food: {
                restaurantId: branch.restaurantId,
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

const updateStatus = async (branchId, foodId, status, user) => {
    const validStatus = ["AVAILABLE", "OUT_OF_STOCK", "INACTIVE"];

    if (!validStatus.includes(status)) {
        throw new Error("Trạng thái không hợp lệ.");
    }

    const branch = await checkBranchAccess(branchId, user);

    const branchFood = await prisma.branchFood.findFirst({
        where: {
            branchId: branch.id,
            foodId: Number(foodId),
            food: {
                restaurantId: branch.restaurantId,
            },
        },
    });

    if (!branchFood) {
        throw new Error("Không tìm thấy món ăn tại chi nhánh.");
    }

    return await prisma.branchFood.update({
        where: {
            branchId_foodId: {
                branchId: branch.id,
                foodId: Number(foodId),
            },
        },
        data: { status },
    });
};

module.exports = {
    getAll,
    updateStatus,
};