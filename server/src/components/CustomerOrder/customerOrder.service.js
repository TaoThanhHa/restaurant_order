const prisma = require("../../config/prisma");

const ACTIVE_ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "SERVED",
];

const create = async (customerId, tableId, items) => {

    if (!tableId) {
        throw new Error("Thiếu mã bàn.");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Chưa chọn món.");
    }

    return prisma.$transaction(async (tx) => {
        

        //////////////////////////////////////////////////////
        // CUSTOMER
        //////////////////////////////////////////////////////

        const customer = await tx.customer.findUnique({
            where: {
                id: customerId,
            },
        });

        if (!customer) {
            throw new Error("Khách hàng không tồn tại.");
        }

        if (!customer.isActive) {
            throw new Error("Tài khoản khách không hoạt động.");
        }

        //////////////////////////////////////////////////////
        // TABLE
        //////////////////////////////////////////////////////

        const table = await tx.table.findUnique({
            where: {
                qrCode: tableId,
            },

            include: {
                floor: {
                    include: {
                        branch: true,
                    },
                },
            },
        });

        if (!table) {
            throw new Error("Bàn không tồn tại.");
        }

        if (table.status === "DISABLED") {
            throw new Error("Bàn đang ngừng sử dụng.");
        }

        //////////////////////////////////////////////////////
        // SESSION
        //////////////////////////////////////////////////////

        let session = await tx.diningSession.findFirst({
            where: {
                tableId: table.id,
                status: "ACTIVE",
            },
        });

        //////////////////////////////////////////////////////
        // ORDER
        //////////////////////////////////////////////////////

        let order = null;

        if (session) {

            order = await tx.order.findFirst({
                where: {
                    sessionId: session.id,

                    status: {
                        in: ACTIVE_ORDER_STATUSES,
                    },
                },

                orderBy: {
                    createdAt: "desc",
                },

                include: {
                    orderItems: true,
                },
            });

        }

        //////////////////////////////////////////////////////
        // CHƯA CÓ SESSION
        //////////////////////////////////////////////////////

        if (!session) {

            session = await tx.diningSession.create({
                data: {
                    tableId: table.id,
                    status: "ACTIVE",
                },
            });

            // Chỉ khi khách thực sự gửi món
            // mới chuyển bàn thành OCCUPIED

            await tx.table.update({
                where: {
                    id: table.id,
                },

                data: {
                    status: "OCCUPIED",
                },
            });

        }

        //////////////////////////////////////////////////////
        // CHƯA CÓ ORDER
        //////////////////////////////////////////////////////

        if (!order) {

            order = await tx.order.create({
                data: {
                    orderCode: `OD${Date.now()}`,

                    sessionId: session.id,

                    branchId: table.floor.branchId,

                    orderType: "DINE_IN",

                    status: "PENDING",

                    totalAmount: 0,
                },

                include: {
                    orderItems: true,
                },
            });

        } else {

            // Nếu order cũ đã tồn tại nhưng bàn somehow
            // chưa OCCUPIED thì đồng bộ lại.

            if (table.status !== "OCCUPIED") {

                await tx.table.update({
                    where: {
                        id: table.id,
                    },

                    data: {
                        status: "OCCUPIED",
                    },
                });

            }

        }

        //////////////////////////////////////////////////////
        // ORDER MEMBER
        //////////////////////////////////////////////////////

        const member = await tx.orderMember.findFirst({
            where: {
                customerId,
                orderId: order.id,
            },
        });

        if (!member) {

            await tx.orderMember.create({
                data: {
                    customerId,
                    orderId: order.id,
                },
            });

        }
        //////////////////////////////////////////////////////
        // ADD ITEM
        //////////////////////////////////////////////////////

        let total = Number(order.totalAmount || 0);

        for (const item of items) {

            if (!item.foodId) {
                throw new Error("Thiếu món ăn.");
            }

            if (!item.quantity || item.quantity <= 0) {
                throw new Error("Số lượng món không hợp lệ.");
            }

            //////////////////////////////////////////////////////
            // BRANCH FOOD
            //////////////////////////////////////////////////////

            const branchFood = await tx.branchFood.findUnique({
                where: {
                    branchId_foodId: {
                        branchId: table.floor.branchId,
                        foodId: item.foodId,
                    },
                },

                include: {
                    food: true,
                },
            });

            if (!branchFood) {
                throw new Error(
                    `Món ăn ID ${item.foodId} không có tại chi nhánh này.`
                );
            }

            if (!branchFood.food) {
                throw new Error(
                    `Món ăn ID ${item.foodId} không tồn tại.`
                );
            }

            //////////////////////////////////////////////////////
            // KIỂM TRA TRẠNG THÁI BÁN TẠI CHI NHÁNH
            //////////////////////////////////////////////////////

            if (branchFood.status !== "AVAILABLE") {
                throw new Error(
                    `Món "${branchFood.food.name}" hiện không bán tại chi nhánh này.`
                );
            }

            //////////////////////////////////////////////////////
            // FOOD
            //////////////////////////////////////////////////////

            const food = branchFood.food;

            //////////////////////////////////////////////////////
            // TẠO ORDER ITEM
            //////////////////////////////////////////////////////

            await tx.orderItem.create({
                data: {
                    orderId: order.id,

                    foodId: food.id,

                    quantity: item.quantity,

                    price: food.price,

                    note: item.note || null,

                    status: "PENDING",
                },
            });

            total +=
                Number(food.price) *
                Number(item.quantity);
        }

        //////////////////////////////////////////////////////
        // UPDATE ORDER
        //////////////////////////////////////////////////////

        const updatedOrder = await tx.order.update({
            where: {
                id: order.id,
            },

            data: {
                totalAmount: total,

                // Khách đặt thêm món
                // => order quay lại chờ xác nhận

                status: "PENDING",
            },

            include: {

                orderItems: {
                    include: {
                        food: true,
                    },
                },

                orderMembers: {
                    include: {
                        customer: true,
                    },
                },

                session: {
                    include: {
                        table: {
                            include: {
                                floor: {
                                    include: {
                                        branch: true,
                                    },
                                },
                            },
                        },
                    },
                },

            },
        });

        return updatedOrder;

    });

};

module.exports = {
    create,
};