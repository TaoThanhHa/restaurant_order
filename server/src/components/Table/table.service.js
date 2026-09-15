const prisma = require("../../config/prisma");
const { v4: uuidv4 } = require("uuid");
const sseService = require("../../services/sse.service");

const ACTIVE_ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "SERVED",
];

const checkBranchAccess = async (branchId, user) => {
    const branch = await prisma.branch.findUnique({
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

    // BRANCH chỉ được thao tác trên branch của mình
    if (user?.role === "BRANCH") {
        if (Number(user.branchId) !== branch.id) {
            throw new Error(
                "Bạn không có quyền thực hiện trên chi nhánh này."
            );
        }
    }

    // ADMIN chỉ được thao tác trên restaurant của mình
    if (user?.role === "ADMIN") {
        if (
            Number(user.restaurantId) !==
            Number(branch.restaurantId)
        ) {
            throw new Error(
                "Bạn không có quyền thực hiện trên chi nhánh này."
            );
        }
    }

    return branch;
};

// ======================================================
// GET ALL
// ======================================================

const getAll = async (user) => {
    const where =
        user?.role === "BRANCH"
            ? {
                  floor: {
                      branchId: Number(user.branchId),
                  },
              }
            : {
                  floor: {
                      branch: {
                          restaurantId: Number(
                              user.restaurantId
                          ),
                      },
                  },
              };

    return await prisma.table.findMany({
        where,
        include: {
            floor: {
                include: {
                    branch: true,
                },
            },
        },
        orderBy: [
            {
                floor: {
                    branchId: "asc",
                },
            },
            {
                floor: {
                    floorNumber: "asc",
                },
            },
            {
                tableNumber: "asc",
            },
        ],
    });
};

// ======================================================
// NOTIFY ORDER CUSTOMERS
// ======================================================

const notifyOrderCustomers = async (
    orderId,
    event = "order.updated"
) => {
    const members =
        await prisma.orderMember.findMany({
            where: {
                orderId: Number(orderId),
            },
            select: {
                customerId: true,
            },
        });

    const customerIds = [
        ...new Set(
            members
                .map(
                    (item) =>
                        item.customerId
                )
                .filter(Boolean)
        ),
    ];

    for (const customerId of customerIds) {
        sseService.sendToCustomer(
            customerId,
            event,
            {
                orderId: Number(orderId),
            }
        );
    }
};

const getByFloor = async (floorId, user) => {
    const floorIdNumber = Number(floorId);

    if (!floorIdNumber) {
        throw new Error("Vui lòng chọn tầng.");
    }

    if (!user) {
        throw new Error("Chưa xác thực người dùng.");
    }

    const floor = await prisma.floor.findFirst({
        where: {
            id: floorIdNumber,
            ...(user.role === "ADMIN"
                ? {
                      branch: {
                          restaurantId: Number(
                              user.restaurantId
                          ),
                      },
                  }
                : {
                      branchId: Number(
                          user.branchId
                      ),
                  }),
        },
        select: {
            id: true,
            branchId: true,
        },
    });

    if (!floor) {
        throw new Error(
            "Tầng không tồn tại hoặc bạn không có quyền truy cập."
        );
    }

    const tables = await prisma.table.findMany({
        where: {
            floorId: floorIdNumber,
        },
        include: {
            sessions: {
                where: {
                    status: "ACTIVE",
                },
                include: {
                    orders: {
                        where: {
                            status: {
                                in: ACTIVE_ORDER_STATUSES,
                            },
                        },
                        select: {
                            id: true,
                            orderCode: true,
                            status: true,
                            totalAmount: true,
                            orderType: true,
                            createdAt: true,
                        },
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
            },
        },
        orderBy: {
            tableNumber: "asc",
        },
    });

    return tables.map(table => ({
        ...table,
        orders: table.sessions.flatMap(
            session => session.orders
        ),
    }));
};

const getById = async (
    id,
    user
) => {
    const table =
        await prisma.table.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                floor: {
                    include: {
                        branch: true,
                    },
                },
                sessions: {
                    where: {
                        status: "ACTIVE",
                    },
                    include: {
                        customers: true,
                        orders: {
                            where: {
                                status: {
                                    in: [
                                        "PENDING",
                                        "CONFIRMED",
                                        "PREPARING",
                                        "SERVED",
                                    ],
                                },
                            },
                            include: {
                                createdByUser: true,
                                createdByCustomer: true,
                                orderMembers: {
                                    include: {
                                        customer: true,
                                    },
                                },
                                orderItems: {
                                    include: {
                                        food: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        },
                    },
                },
            },
        });

    if (!table) {
        throw new Error(
            "Bàn không tồn tại."
        );
    }

    // Table → Floor → Branch
    // kiểm tra Branch thuộc user
    await checkBranchAccess(
        table.floor.branchId,
        user
    );

    const session =
        table.sessions[0];

    const orders = session
        ? session.orders.map(
              (order) => ({
                  ...order,
                  customer:
                      order.createdByCustomer ||
                      order.createdByUser ||
                      null,
              })
          )
        : [];

    return {
        ...table,
        session,
        customers: session
            ? session.customers
            : [],
        orders,
    };
};

// ======================================================
// CREATE
// ======================================================

const create = async (
    data,
    user
) => {
    const {
        floorId,
        tableNumber,
        capacity = 4,
    } = data;

    const floorIdNumber =
        Number(floorId);

    const tableNumberNumber =
        Number(tableNumber);

    const capacityNumber =
        Number(capacity);

    if (!floorIdNumber) {
        throw new Error(
            "Vui lòng chọn tầng."
        );
    }

    if (!tableNumberNumber) {
        throw new Error(
            "Vui lòng nhập số bàn."
        );
    }

    if (
        !capacityNumber ||
        capacityNumber < 1
    ) {
        throw new Error(
            "Số người trong bàn không hợp lệ."
        );
    }

    const floor =
        await prisma.floor.findUnique({
            where: {
                id: floorIdNumber,
            },
        });

    if (!floor) {
        throw new Error(
            "Tầng không tồn tại."
        );
    }

    // Không cho tạo bàn vào tầng
    // của restaurant khác
    await checkBranchAccess(
        floor.branchId,
        user
    );

    const existed =
        await prisma.table.findUnique({
            where: {
                floorId_tableNumber: {
                    floorId: floorIdNumber,
                    tableNumber:
                        tableNumberNumber,
                },
            },
        });

    if (existed) {
        throw new Error(
            "Bàn đã tồn tại."
        );
    }

    return await prisma.table.create({
        data: {
            floorId: floorIdNumber,
            tableNumber:
                tableNumberNumber,
            capacity:
                capacityNumber,
            qrCode: uuidv4(),
        },
    });
};

// ======================================================
// UPDATE
// ======================================================

const update = async (
    id,
    data,
    user
) => {
    const table =
        await prisma.table.findUnique({
            where: {
                id: Number(id),
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

    // Kiểm tra bàn hiện tại
    await checkBranchAccess(
        table.floor.branchId,
        user
    );

    const floorId = Number(
        data.floorId ??
            table.floorId
    );

    const tableNumber = Number(
        data.tableNumber ??
            table.tableNumber
    );

    const capacity = Number(
        data.capacity ??
            table.capacity
    );

    if (
        !capacity ||
        capacity < 1
    ) {
        throw new Error(
            "Số người trong bàn không hợp lệ."
        );
    }

    const newFloor =
        await prisma.floor.findUnique({
            where: {
                id: floorId,
            },
        });

    if (!newFloor) {
        throw new Error(
            "Tầng không tồn tại."
        );
    }

    // Không cho chuyển bàn
    // sang branch/restaurant khác
    await checkBranchAccess(
        newFloor.branchId,
        user
    );

    const existed =
        await prisma.table.findFirst({
            where: {
                floorId,
                tableNumber,
                NOT: {
                    id: Number(id),
                },
            },
        });

    if (existed) {
        throw new Error(
            "Số bàn đã tồn tại."
        );
    }

    return await prisma.table.update({
        where: {
            id: Number(id),
        },
        data: {
            floorId,
            tableNumber,
            capacity,
        },
    });
};

// ======================================================
// REMOVE
// ======================================================

const remove = async (
    id,
    user
) => {
    const table =
        await prisma.table.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                floor: true,
                sessions: {
                    include: {
                        orders: true,
                    },
                },
            },
        });

    if (!table) {
        throw new Error(
            "Bàn không tồn tại."
        );
    }

    await checkBranchAccess(
        table.floor.branchId,
        user
    );

    const hasOrders =
        table.sessions.some(
            (session) =>
                session.orders.length > 0
        );

    if (hasOrders) {
        throw new Error(
            "Bàn đã phát sinh đơn hàng, không thể xóa."
        );
    }

    await prisma.table.delete({
        where: {
            id: Number(id),
        },
    });
};

// ======================================================
// SCAN QR
// ======================================================

const scanQr = async (
    qrCode
) => {
    const table =
        await prisma.table.findUnique({
            where: {
                qrCode,
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
        throw new Error(
            "QR Code không hợp lệ."
        );
    }

    const foods =
        await prisma.branchFood.findMany({
            where: {
                branchId:
                    table.floor.branchId,
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

    const session =
        await prisma.diningSession.findFirst({
            where: {
                tableId: table.id,
                status: "ACTIVE",
            },
            include: {
                customers: true,
                orders: {
                    where: {
                        status: {
                            in: [
                                "PENDING",
                                "CONFIRMED",
                                "PREPARING",
                            ],
                        },
                    },
                    include: {
                        createdByCustomer: true,
                        orderItems: {
                            include: {
                                food: true,
                            },
                        },
                    },
                },
            },
        });

    return {
        table,
        branch: table.floor.branch,
        foods,
        hasActiveOrder:
            session &&
            session.orders.length > 0,
        session,
        currentOrders:
            session
                ? session.orders
                : [],
    };
};

// ======================================================
// OPEN TABLE
// ======================================================

const open = async (
    tableId,
    data
) => {
    const {
        name,
        phone,
    } = data;

    if (!name?.trim()) {
        throw new Error(
            "Vui lòng nhập tên khách."
        );
    }

    const table =
        await prisma.table.findUnique({
            where: {
                id: Number(tableId),
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

    let session =
        await prisma.diningSession.findFirst({
            where: {
                tableId: Number(
                    tableId
                ),
                status: "ACTIVE",
            },
        });

    if (!session) {
        session =
            await prisma.diningSession.create({
                data: {
                    tableId: Number(
                        tableId
                    ),
                    status: "ACTIVE",
                },
            });
    }

    const customer =
        await prisma.customer.create({
            data: {
                sessionId:
                    session.id,
                name: name.trim(),
                phone:
                    phone || null,
            },
        });

    await prisma.table.update({
        where: {
            id: Number(tableId),
        },
        data: {
            status: "OCCUPIED",
        },
    });

    sseService.sendToBranch(
        table.floor.branchId,
        "table.updated",
        {
            tableId: table.id,
        }
    );

    return {
        session,
        customer,
    };
};

module.exports = {
    getAll,
    notifyOrderCustomers,
    getByFloor,
    getById,
    create,
    update,
    remove,
    scanQr,
    open,
};