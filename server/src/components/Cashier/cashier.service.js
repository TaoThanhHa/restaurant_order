const prisma = require("../../config/prisma");

// DASHBOARD
const dashboard = async (branchId) => {

    if (!branchId) {
        throw new Error("Không xác định được chi nhánh.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
        openOrders,
        availableTables,
        occupiedTables,
        payments,
    ] = await Promise.all([

        prisma.order.count({
            where: {
                branchId,
                status:{
                    in: [
                        "PENDING",
                        "CONFIRMED",
                        "PREPARING",
                    ],
                }
            },
        }),

        prisma.table.count({
            where: {
                floor: {
                    branchId,
                },
                status: "AVAILABLE",
            },
        }),

        prisma.table.count({
            where: {
                floor: {
                    branchId,
                },
                status: "OCCUPIED",
            },
        }),

        prisma.payment.findMany({
            where: {
                paymentStatus: "PAID",
                paidAt: {
                    gte: today,
                    lt: tomorrow,
                },
                order: {
                    branchId,
                },
            },
            select: {
                totalAmount: true,
            },
        }),

    ]);

    const todayRevenue = payments.reduce(
        (sum, item) => sum + Number(item.totalAmount),
        0
    );

    return {
        todayRevenue,
        openOrders,
        availableTables,
        occupiedTables,
    };

};

// GET TABLES
const getTables = async (branchId) => {

    if (!branchId) {
        throw new Error("Không xác định được chi nhánh.");
    }

    return await prisma.floor.findMany({

        where: {
            branchId,
        },

        orderBy: {
            floorNumber: "asc",
        },

        include: {

            tables: {

                orderBy: {
                    tableNumber: "asc",
                },

                include: {

                    sessions: {

                        where: {
                            status: "ACTIVE",
                        },

                        include: {

                            customers: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },

                            orders: {
                                where: {
                                    status: {
                                        in: [
                                            "PENDING",
                                            "CONFIRMED",
                                            "PREPARING",
                                        ]
                                    },
                                },

                                orderBy: {
                                    createdAt: "asc",
                                },

                                include: {
                                    orderMembers: {
                                        include: {
                                            customer: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                },
                                            },
                                        },
                                    },

                                    orderItems: {
                                        where: {
                                            status: {
                                                not: "CANCELLED",
                                            },
                                        },

                                        include: {
                                            food: true,
                                        },

                                        orderBy: {
                                            id: "asc",
                                        },

                                    },

                                },

                            },

                        },

                    },

                },

            },

        },

    });

};

// GET PENDING ORDERS
const getPendingOrders = async (branchId) => {

    if (!branchId) {
        throw new Error("Không xác định được chi nhánh.");
    }

    return await prisma.order.findMany({

        where: {
            branchId,
            status: "PENDING",

            orderItems: {
                some: {
                    status: "PENDING",
                },
            },
        },

        orderBy: {
            createdAt: "asc",
        },

        include: {

            session: {
                include: {
                    table: true,
                },
            },

            orderMembers: {
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },

            orderItems: {

                where: {
                    status: "PENDING",
                },

                include: {
                    food: true,
                },

                orderBy: {
                    id: "asc",
                },

            },

        },

    });

};

// GET SERVING ORDERS
const getServingOrders = async (branchId) => {

    if (!branchId) {
        throw new Error("Không xác định được chi nhánh.");
    }

    return await prisma.order.findMany({

        where: {

            branchId,
            status: "CONFIRMED",

            orderItems: {

                some: {

                    status: {

                        in: [
                            "CONFIRMED",
                            "PREPARING",
                            "READY",
                            "SERVED",
                        ],

                    },

                },

            },

        },

        orderBy: {
            updatedAt: "asc",
        },

        include: {
            session: {
                include: {
                    table: true,
                },
            },

            orderMembers: {
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            orderItems: {
                where: {
                    status: {
                        in: [
                            "CONFIRMED",
                            "PREPARING",
                            "READY",
                            "SERVED",
                        ],
                    },
                },

                include: {
                    food: true,
                },

                orderBy: {
                    id: "asc",
                },
            },
        },
    });
};

// UPDATE ORDER ITEM STATUS
const updateOrderItemStatus = async (
    branchId,
    itemId,
    status
) => {
    const item = await prisma.orderItem.findUnique({
        where: {
            id: Number(itemId),
        },

        include: {
            food: true,
            order: {
                include: {
                    session: {
                        include: {
                            table: true,
                        },
                    },
                },
            },
        },
    });

    if (!item) {
        throw new Error("Món không tồn tại.");
    }

    if (item.order.branchId !== branchId) {
        throw new Error("Bạn không có quyền thao tác.");
    }

    if (item.order.status === "COMPLETED" || item.order.status === "CANCELLED") {
        throw new Error("Hóa đơn đã đóng.");
    }

    const flow = {
        PENDING: "CONFIRMED",
        PREPARING:"PREPARING",
        CONFIRMED: "PREPARING",
        PREPARING: "READY",
        READY: "SERVED",
    };

    if (status === "CANCELLED") {
        if (
            item.status === "READY" ||
            item.status === "SERVED"
        ) {
            throw new Error("Không thể hủy món đã sẵn sàng hoặc đã phục vụ.");
        }

        const updated = await prisma.orderItem.update({
            where: {
                id: item.id,
            },
            data: {
                status: "CANCELLED",
            },
            include: {
                food: true,
            },
        });
        return updated;
    }
    // Kiểm tra flow
    const next = flow[item.status];
    if (next !== status) {
        throw new Error(
            `Không thể chuyển từ ${item.status} sang ${status}.`
        );
    }
    const updated = await prisma.orderItem.update({
        where: {
            id: item.id,
        },
        data: {
            status,
        },
        include: {
            food: true,
        },
    });
    return updated;
};

// GET ORDER DETAIL
const getOrderDetail = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: {
            id: Number(orderId),
        },

        include: {
            session: {
                include: {
                    table: {
                        include: {
                            floor: true,
                        },
                    },
                },
            },

            orderMembers: {
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            },

            orderItems: {
                include: {
                    food: true,
                },

                orderBy: {
                    id: "asc",
                },

            },
            payment: true,
        },
    });

    if (!order) {
        throw new Error("Hóa đơn không tồn tại.");
    }

    const totalAmount = order.orderItems
        .filter(item => item.status !== "CANCELLED")
        .reduce((sum, item) => {
            return sum + Number(item.price) * item.quantity;
        }, 0);

    return {
        ...order,
        totalAmount,
    };

};

// GET OPEN ORDERS
const getOpenOrders = async (branchId) => {
    if (!branchId) {
        throw new Error("Không xác định được chi nhánh.");
    }

    const orders = await prisma.order.findMany({
        where: {
            branchId,
            status: {
                in: [
                    "PENDING",
                    "CONFIRMED",
                    "PREPARING",
                ]
            },
        },

        orderBy: {
            createdAt: "asc",
        },

        include: {
            session: {
                include: {
                    table: true,
                },
            },

            orderMembers: {
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },

            orderItems: {
                where: {
                    status: {
                        not: "CANCELLED",
                    },
                },

                include: {
                    food: true,
                },
            },
        },
    });

    return orders.map(order => ({
        ...order,
        totalAmount: order.orderItems.reduce((sum, item) => {
            return sum + Number(item.price) * item.quantity;
        }, 0),
    }));
};

// PAYMENT
const payment = async (orderId, data) => {
    const { paymentMethod } = data;

    const order = await prisma.order.findUnique({
        where: {
            id: Number(orderId),
        },

        include: {
            session: {
                include: {
                    table: true,
                },
            },

            payment: true,

            orderItems: true,

        },
    });

    if (!order) {
        throw new Error("Hóa đơn không tồn tại.");
    }

    if (item.order.status === "COMPLETED" || item.order.status === "CANCELLED") {
        throw new Error("Hóa đơn đã thanh toán.");
    }

      
    // Không có món
      

    const items = order.orderItems.filter(
        item => item.status !== "CANCELLED"
    );

    if (items.length === 0) {
        throw new Error("Hóa đơn chưa có món.");
    }

      
    // Chưa phục vụ xong
      

    const unfinished = items.find(item =>
        item.status !== "SERVED"
    );

    if (unfinished) {
        throw new Error(
            "Vẫn còn món chưa phục vụ, không thể thanh toán."
        );
    }

    // Tổng tiền
    const totalAmount = items.reduce((sum, item) => {

        return (
            sum +
            Number(item.price) * item.quantity
        );

    }, 0);

    // TRANSACTION

    await prisma.$transaction(async (tx) => {
        // Payment
        if (order.payment) {
            await tx.payment.update({
                where: {
                    orderId: order.id,
                },

                data: {
                    paymentMethod,
                    paymentStatus: "PAID",
                    totalAmount,
                    paidAt: new Date(),
                },
            });
        } else {
            await tx.payment.create({
                data: {
                    orderId: order.id,
                    paymentMethod,
                    paymentStatus: "PAID",
                    totalAmount,
                    paidAt: new Date(),
                },
            });
        }

        await tx.order.update({
            where: {
                id: order.id,
            },

            data: {
                status: "COMPLETED",
                totalAmount,
            },
        });

        // Đóng session nếu không còn hóa đơn 
        const remainOrders = await tx.order.count({
            where: {
                sessionId: order.sessionId,
                status: {
                    in: [
                        "PENDING",
                        "CONFIRMED",
                        "PREPARING",
                    ]
                },
            },
        });

        if (remainOrders === 0) {
            await tx.diningSession.update({
                where: {
                    id: order.sessionId,
                },

                data: {
                    status: "CLOSED",
                    closedAt: new Date(),
                },
            });

            await tx.table.update({
                where: {
                    id: order.session.tableId,
                },
                data: {
                    status: "AVAILABLE",
                },
            });
        }
    });

    return {
        orderId: order.id,
        paymentMethod,
        totalAmount,
        paymentStatus: "PAID",
    };
};

const getStatistics = async (branchId) => {

    // =========================================
    // HÔM NAY
    // =========================================

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    // =========================================
    // HÔM QUA
    // =========================================

    const yesterday = new Date(today);

    yesterday.setDate(
        yesterday.getDate() - 1
    );


    // =========================================
    // 7 NGÀY: HÔM QUA -> 6 NGÀY TRƯỚC ĐÓ
    // Không lấy hôm nay
    // =========================================

    const fromDate = new Date(yesterday);

    fromDate.setDate(
        fromDate.getDate() - 6
    );


    // =========================================
    // NGÀY KẾT THÚC
    // =========================================

    const toDate = new Date(today);


    // =========================================
    // LẤY PAYMENT
    // =========================================

    const payments = await prisma.payment.findMany({

        where: {

            paymentStatus: "PAID",

            paidAt: {

                gte: fromDate,

                lt: toDate,

            },

            order: {

                branchId,

            },

        },

        select: {

            totalAmount: true,

            paidAt: true,

            order: {

                select: {

                    orderType: true,

                    orderMembers: {

                        select: {

                            customer: {

                                select: {

                                    id: true,

                                    isGuest: true,

                                },

                            },

                        },

                    },

                },

            },

        },

        orderBy: {

            paidAt: "asc",

        },

    });


    // =========================================
    // HÀM LẤY YYYY-MM-DD THEO LOCAL TIME
    // Không dùng toISOString()
    // =========================================

    const getLocalDateString = (date) => {

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    };


    // =========================================
    // TẠO 7 NGÀY
    // =========================================

    const statistics = [];


    for (let i = 0; i < 7; i++) {

        const date = new Date(fromDate);

        date.setDate(
            fromDate.getDate() + i
        );


        const dateString =
            getLocalDateString(date);


        // =====================================
        // PAYMENT TRONG NGÀY
        // =====================================

        const dayPayments =
            payments.filter(payment => {

                if (!payment.paidAt) {

                    return false;

                }


                const paymentDate =
                    getLocalDateString(
                        new Date(payment.paidAt)
                    );


                return paymentDate === dateString;

            });


        // =========================================
        // THÀNH VIÊN
        // =========================================

        const memberRevenue =
            dayPayments
                .filter(payment => {

                    const members =
                        payment.order?.orderMembers || [];


                    return members.some(
                        member =>
                            member.customer &&
                            member.customer.isGuest === false
                    );

                })
                .reduce(
                    (sum, payment) =>
                        sum + Number(
                            payment.totalAmount || 0
                        ),
                    0
                );


        // =========================================
        // VÃNG LAI
        // =========================================

        const guestRevenue =
            dayPayments
                .filter(payment => {

                    const members =
                        payment.order?.orderMembers || [];


                    return !members.some(
                        member =>
                            member.customer &&
                            member.customer.isGuest === false
                    );

                })
                .reduce(
                    (sum, payment) =>
                        sum + Number(
                            payment.totalAmount || 0
                        ),
                    0
                );


        // =========================================
        // LẤY ORDER TYPE
        // =========================================

        const dineInPayments =
            dayPayments.filter(payment => {

                const orderType =
                    String(
                        payment.order?.orderType || ""
                    )
                        .trim()
                        .toUpperCase()
                        .replace(/[-\s]/g, "_");


                return (

                    orderType === "DINE_IN" ||

                    orderType === "DINEIN"

                );

            });


        const takeAwayPayments =
            dayPayments.filter(payment => {

                const orderType =
                    String(
                        payment.order?.orderType || ""
                    )
                        .trim()
                        .toUpperCase()
                        .replace(/[-\s]/g, "_");


                return (

                    orderType === "TAKE_AWAY" ||

                    orderType === "TAKEAWAY" ||

                    orderType === "TAKE_OUT" ||

                    orderType === "TAKEOUT"

                );

            });


        // =========================================
        // DOANH THU TẠI CHỖ
        // =========================================

        const dineInRevenue =
            dineInPayments.reduce(
                (sum, payment) =>
                    sum + Number(
                        payment.totalAmount || 0
                    ),
                0
            );


        // =========================================
        // DOANH THU MANG VỀ
        // =========================================

        const takeAwayRevenue =
            takeAwayPayments.reduce(
                (sum, payment) =>
                    sum + Number(
                        payment.totalAmount || 0
                    ),
                0
            );


        // =========================================
        // TỔNG DOANH THU
        // =========================================

        const total =
            dineInRevenue +
            takeAwayRevenue;


        // =========================================
        // DEBUG
        // =========================================

        console.log(
            `[STATISTICS] ${dateString}`,
            {
                total: total,
                member: memberRevenue,
                guest: guestRevenue,
                dineIn: dineInRevenue,
                takeAway: takeAwayRevenue,
                paymentCount: dayPayments.length,
            }
        );


        statistics.push({

            date: dateString,

            label: date.toLocaleDateString(
                "vi-VN",
                {
                    day: "2-digit",
                    month: "2-digit",
                }
            ),

            member: memberRevenue,

            guest: guestRevenue,

            dineIn: dineInRevenue,

            takeAway: takeAwayRevenue,

            total,

        });

    }


    return statistics;

};

module.exports = {
    dashboard,
    getTables,
    getPendingOrders,
    getServingOrders,
    updateOrderItemStatus,
    getOrderDetail,
    getOpenOrders,
    payment,
    getStatistics,
};