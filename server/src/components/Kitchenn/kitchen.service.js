const prisma = require("../../config/prisma");
const sseService = require("../../services/sse.service");

// ======================================================
// INCLUDE
// ======================================================

const kitchenItemInclude = {
    food: true,

    order: {
        include: {
            session: {
                include: {
                    table: true,
                },
            },

            createdByUser: true,
            createdByCustomer: true,
        },
    },
};

// ======================================================
// NGÀY HÔM NAY
// ======================================================

const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return {
        gte: start,
        lte: end,
    };
};

// ======================================================
// MAP ORDER
// ======================================================

const mapKitchenOrder = (order, items) => {
    const totalItems = items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const firstItemCreatedAt = items.reduce(
        (earliest, item) => {
            if (!earliest) {
                return item.createdAt;
            }

            return item.createdAt < earliest
                ? item.createdAt
                : earliest;
        },
        null
    );

    return {
        id: order.id,
        orderCode: order.orderCode,
        orderType: order.orderType,
        status: order.status,
        note: order.note,

        // Thời gian tạo đơn
        createdAt: order.createdAt,

        // Thời gian món đầu tiên được thêm
        firstItemCreatedAt,

        createdByUser: order.createdByUser
            ? {
                id: order.createdByUser.id,
                username: order.createdByUser.username,
            }
            : null,

        createdByCustomer: order.createdByCustomer
            ? {
                id: order.createdByCustomer.id,
                name: order.createdByCustomer.name,
                phone: order.createdByCustomer.phone,
            }
            : null,

        table: order.session?.table
            ? {
                id: order.session.table.id,
                tableNumber: order.session.table.tableNumber,
            }
            : null,

        items: items.map((item) => ({
            id: item.id,
            foodId: item.foodId,
            foodName: item.food.name,
            quantity: item.quantity,
            price: Number(item.price),
            note: item.note,

            status: item.status,
            kitchenStatus: item.kitchenStatus,

            // Thời gian món được thêm vào đơn
            createdAt: item.createdAt,

            kitchenSentAt: item.kitchenSentAt,
            kitchenReadyAt: item.kitchenReadyAt,
            kitchenCompletedAt: item.kitchenCompletedAt,
        })),

        totalItems,
    };
};

// ======================================================
// LẤY DANH SÁCH ĐƠN THEO KITCHEN STATUS
// ======================================================

const getOrdersByKitchenStatus = async (
    branchId,
    kitchenStatuses
) => {
    const today = getTodayRange();

    // WAITING / PREPARING:
    // Chỉ những đơn Cashier đã bấm "Bắt đầu chế biến"
    //
    // COMPLETED:
    // Không cần Order.status = PREPARING vì sau này
    // Cashier có thể chuyển trạng thái Order tiếp.
    const orderStatus =
        kitchenStatuses.includes("WAITING") ||
        kitchenStatuses.includes("PREPARING")
            ? "PREPARING"
            : undefined;

    const items = await prisma.orderItem.findMany({
        where: {
            kitchenStatus: {
                in: kitchenStatuses,
            },

            status: {
                not: "CANCELLED",
            },

            order: {
                branchId,

                createdAt: today,

                status: orderStatus
                    ? orderStatus
                    : {
                        not: "CANCELLED",
                    },
            },
        },

        include: kitchenItemInclude,

        // QUAN TRỌNG:
        // Sắp xếp theo thời điểm món được thêm vào đơn
        orderBy: {
            createdAt: "asc",
        },
    });

    // ==================================================
    // GỘP CÁC ITEM THÀNH ORDER
    // ==================================================

    const orderMap = new Map();

    for (const item of items) {
        const order = item.order;

        if (!orderMap.has(order.id)) {
            orderMap.set(order.id, {
                order,
                items: [],
                firstItemCreatedAt: item.createdAt,
            });
        }

        orderMap
            .get(order.id)
            .items
            .push(item);
    }

    // ==================================================
    // MAP + SORT THEO MÓN ĐẦU TIÊN
    // ==================================================

    return Array.from(orderMap.values())
        .map(({ order, items, firstItemCreatedAt }) => ({
            ...mapKitchenOrder(order, items),

            firstItemCreatedAt,
        }))
        .sort(
            (a, b) =>
                new Date(a.firstItemCreatedAt).getTime() -
                new Date(b.firstItemCreatedAt).getTime()
        );
};

// ======================================================
// HÀNG CHỜ
// ======================================================

const getPending = async (branchId) => {
    return getOrdersByKitchenStatus(
        branchId,
        ["WAITING"]
    );
};

// ======================================================
// ĐANG CHẾ BIẾN
// ======================================================

const getPreparing = async (branchId) => {
    return getOrdersByKitchenStatus(
        branchId,
        ["PREPARING"]
    );
};

// ======================================================
// HOÀN THÀNH
// ======================================================

const getCompleted = async (branchId) => {
    return getOrdersByKitchenStatus(
        branchId,
        ["COMPLETED"]
    );
};

// ======================================================
// BẮT ĐẦU CHẾ BIẾN CẢ ĐƠN
// ======================================================

const startOrder = async (
    orderId,
    branchId
) => {
    const id = Number(orderId);

    if (!Number.isInteger(id)) {
        throw new Error("Order ID không hợp lệ.");
    }

    const order = await prisma.order.findFirst({
        where: {
            id,
            branchId,

            createdAt: getTodayRange(),

            // Chỉ cho bắt đầu đơn đã được Cashier gửi bếp
            status: "PREPARING",

            orderItems: {
                some: {
                    kitchenStatus: "WAITING",

                    status: {
                        not: "CANCELLED",
                    },
                },
            },
        },

        include: {
            orderItems: true,
        },
    });

    if (!order) {
        throw new Error(
            "Không tìm thấy đơn hoặc đơn không còn trong hàng chờ."
        );
    }

    const waitingItems = order.orderItems.filter(
        (item) =>
            item.kitchenStatus === "WAITING" &&
            item.status !== "CANCELLED"
    );

    if (waitingItems.length === 0) {
        throw new Error(
            "Đơn không có món đang chờ chế biến."
        );
    }

    // Chuyển TOÀN BỘ món đang WAITING
    // sang PREPARING
    await prisma.orderItem.updateMany({
        where: {
            orderId: order.id,

            kitchenStatus: "WAITING",

            status: {
                not: "CANCELLED",
            },
        },

        data: {
            kitchenStatus: "PREPARING",
        },
    });

    // Thông báo cho Kitchen khác / Cashier
    sseService.sendToBranch(
        branchId,
        "kitchen.updated",
        {
            type: "ORDER_STARTED",
            orderId: order.id,
        }
    );

    return {
        orderId: order.id,
    };
};

// ======================================================
// HOÀN THÀNH CẢ ĐƠN
// ======================================================

const completeOrder = async (
    orderId,
    branchId
) => {
    const id = Number(orderId);

    if (!Number.isInteger(id)) {
        throw new Error("Order ID không hợp lệ.");
    }

    const order = await prisma.order.findFirst({
        where: {
            id,
            branchId,

            createdAt: getTodayRange(),

            orderItems: {
                some: {
                    kitchenStatus: "PREPARING",

                    status: {
                        not: "CANCELLED",
                    },
                },
            },
        },

        include: {
            orderItems: true,
        },
    });

    if (!order) {
        throw new Error("Không tìm thấy đơn.");
    }

    const preparingItems = order.orderItems.filter(
        (item) =>
            item.kitchenStatus === "PREPARING" &&
            item.status !== "CANCELLED"
    );

    if (preparingItems.length === 0) {
        throw new Error(
            "Đơn không có món đang chế biến."
        );
    }

    const now = new Date();

    // Chuyển TOÀN BỘ món đang chế biến
    // sang COMPLETED
    await prisma.orderItem.updateMany({
        where: {
            orderId: order.id,

            kitchenStatus: "PREPARING",

            status: {
                not: "CANCELLED",
            },
        },

        data: {
            kitchenStatus: "COMPLETED",
            kitchenCompletedAt: now,
        },
    });

    // Thông báo cập nhật Kitchen
    sseService.sendToBranch(
        branchId,
        "kitchen.updated",
        {
            type: "ORDER_COMPLETED",
            orderId: order.id,
        }
    );

    return {
        orderId: order.id,
    };
};

module.exports = {
    getPending,
    getPreparing,
    getCompleted,
    startOrder,
    completeOrder,
    mapKitchenOrder,
};