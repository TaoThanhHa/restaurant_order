const prisma = require("../../config/prisma");

const ACTIVE_ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "SERVED",
];

const create = async (
    customerId,
    tableId,
    items,
    options = {}
) => {
    const {
        orderId = null,
        newOrder = false,
    } = options;

    if (!tableId) {
        throw new Error("Thiếu mã bàn.");
    }

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        throw new Error("Chưa chọn món.");
    }

    return prisma.$transaction(async (tx) => {

        // ========================================
        // CUSTOMER
        // ========================================

        const customer =
            await tx.customer.findUnique({
                where: {
                    id: customerId,
                },
            });

        if (!customer) {
            throw new Error(
                "Khách hàng không tồn tại."
            );
        }

        if (!customer.isActive) {
            throw new Error(
                "Tài khoản khách không hoạt động."
            );
        }

        // ========================================
        // TABLE
        // ========================================

        const table =
            await tx.table.findUnique({
                where: {
                    qrCode: tableId,
                },
                include: {
                    floor: true,
                },
            });

        if (!table) {
            throw new Error(
                "Bàn không tồn tại."
            );
        }

        if (table.status === "DISABLED") {
            throw new Error(
                "Bàn đang ngừng sử dụng."
            );
        }

        // ========================================
        // DINING SESSION
        // ========================================

        let session =
            await tx.diningSession.findFirst({
                where: {
                    tableId: table.id,
                    status: "ACTIVE",
                },
            });

        if (!session) {

            session =
                await tx.diningSession.create({
                    data: {
                        tableId: table.id,
                        status: "ACTIVE",
                    },
                });

            await tx.table.update({
                where: {
                    id: table.id,
                },
                data: {
                    status: "OCCUPIED",
                },
            });
        }

        // ========================================
        // ACTIVE ORDERS
        // ========================================

        const activeOrders =
            await tx.order.findMany({
                where: {
                    sessionId: session.id,
                    status: {
                        in: ACTIVE_ORDER_STATUSES,
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
                include: {
                    orderItems: true,
                    orderMembers: {
                        include: {
                            customer: true,
                        },
                    },
                },
            });

        let order = null;

        // ========================================
        // CASE 1:
        // KHÁCH CHỦ ĐỘNG CHỌN GỘP ORDER
        // ========================================

        if (orderId) {

            order =
                activeOrders.find(
                    item =>
                        item.id === Number(orderId)
                );

            if (!order) {
                throw new Error(
                    "Đơn hàng không tồn tại hoặc đã kết thúc."
                );
            }
        }

        // ========================================
        // CASE 2:
        // KHÁCH CHỌN TÁCH RIÊNG
        // ========================================

        else if (newOrder) {

            order = null;
        }

        // ========================================
        // CASE 3:
        // KHÁCH ĐÃ CÓ ORDER ĐƯỢC GHI NHỚ
        // ========================================

        else if (customer.currentOrderId) {

            order =
                activeOrders.find(
                    item =>
                        item.id ===
                        customer.currentOrderId
                );

            // Order cũ đã thanh toán / kết thúc
            if (!order) {

                await tx.customer.update({
                    where: {
                        id: customerId,
                    },
                    data: {
                        currentOrderId: null,
                    },
                });
            }
        }

        // ========================================
        // CASE 4:
        // CUSTOMER CHƯA CÓ ORDER
        // NHƯNG BÀN ĐANG CÓ ORDER
        //
        // => CHO KHÁCH CHỌN
        // ========================================

        if (
            !order &&
            !newOrder &&
            activeOrders.length > 0
        ) {

            const orders =
                activeOrders.map(
                    currentOrder => ({
                        id: currentOrder.id,

                        orderCode:
                            currentOrder.orderCode,

                        totalAmount:
                            currentOrder.totalAmount,

                        createdAt:
                            currentOrder.createdAt,

                        customerCount:
                            currentOrder.orderMembers.length,

                        itemCount:
                            currentOrder.orderItems.reduce(
                                (total, item) =>
                                    total +
                                    Number(item.quantity || 0),
                                0
                            ),

                        members:
                            currentOrder.orderMembers.map(
                                member => ({
                                    customerId:
                                        member.customerId,

                                    customerName:
                                        member.customer?.name ||
                                        "Khách",
                                })
                            ),
                    })
                );

            const error =
                new Error(
                    `Bàn ${table.tableNumber} đang có ${orders.length} đơn.`
                );

            error.statusCode = 409;

            error.code =
                "ACTIVE_ORDER_EXISTS";

            error.data = {
                table: {
                    id: table.id,
                    qrCode: table.qrCode,
                    tableNumber:
                        table.tableNumber,
                },

                orders,
            };

            throw error;
        }

        // ========================================
        // CASE 5:
        // TẠO ORDER MỚI
        // ========================================

        if (!order) {

            order =
                await tx.order.create({
                    data: {
                        orderCode:
                            `OD${Date.now()}-${Math.floor(
                                Math.random() * 1000
                            )}`,

                        sessionId: session.id,

                        branchId:
                            table.floor.branchId,

                        orderType:
                            "DINE_IN",

                        status:
                            "PENDING",

                        totalAmount: 0,
                    },

                    include: {
                        orderItems: true,
                        orderMembers: true,
                    },
                });
        }

        // ========================================
        // QUAN TRỌNG
        //
        // LUÔN GHI NHỚ ORDER CUSTOMER ĐANG DÙNG
        //
        // - Gộp A => nhớ A
        // - Tách riêng => nhớ B
        // - Tạo mới => nhớ order mới
        // ========================================

        await tx.customer.update({
            where: {
                id: customerId,
            },
            data: {
                currentOrderId: order.id,
            },
        });

        // ========================================
        // ORDER MEMBER
        // ========================================

        const member =
            await tx.orderMember.findFirst({
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

        // ========================================
        // ADD ITEMS
        // ========================================

        let total =
            Number(order.totalAmount || 0);

        for (const item of items) {

            if (!item.foodId) {
                throw new Error(
                    "Thiếu món ăn."
                );
            }

            if (
                !item.quantity ||
                Number(item.quantity) <= 0
            ) {
                throw new Error(
                    "Số lượng món không hợp lệ."
                );
            }

            const branchFood =
                await tx.branchFood.findUnique({
                    where: {
                        branchId_foodId: {
                            branchId:
                                table.floor.branchId,

                            foodId:
                                Number(item.foodId),
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

            if (
                branchFood.status !==
                "AVAILABLE"
            ) {
                throw new Error(
                    `Món "${branchFood.food.name}" hiện không bán.`
                );
            }

            await tx.orderItem.create({
                data: {
                    orderId: order.id,

                    foodId:
                        branchFood.food.id,

                    quantity:
                        Number(item.quantity),

                    price:
                        branchFood.food.price,

                    note:
                        item.note || null,

                    status:
                        "PENDING",
                },
            });

            total +=
                Number(branchFood.food.price) *
                Number(item.quantity);
        }

        // ========================================
        // UPDATE TOTAL
        // ========================================

        return tx.order.update({
            where: {
                id: order.id,
            },

            data: {
                totalAmount: total,
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
            },
        });
    });
};

module.exports = {
    create,
};