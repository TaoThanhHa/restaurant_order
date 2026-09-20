const prisma = require("../../config/prisma");
const sseService = require("../../services/sse.service");

const ACTIVE_ORDER_STATUSES = ["PENDING", "PREPARING", "SERVED"];

const getBranchScope = user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    if (user.role === "ADMIN") {
        if (!user.restaurantId) throw new Error("Tài khoản chưa được gán nhà hàng.");
        return { restaurantId: Number(user.restaurantId) };
    }

    if (!user.branchId) throw new Error("Tài khoản chưa được gán chi nhánh.");
    return { id: Number(user.branchId) };
};

const checkBranchAccess = async (branchId, user) => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    const branch = await prisma.branch.findUnique({
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

const checkOrderAccess = async (orderId, user) => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        select: { id: true, branchId: true },
    });

    if (!order) throw new Error("Đơn hàng không tồn tại.");
    await checkBranchAccess(order.branchId, user);

    return order;
};

const notifyOrderCustomers = async (orderId, event = "order.updated") => {
    const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        select: {
            id: true,
            branchId: true,
            session: { select: { tableId: true } },
            orderMembers: { select: { customerId: true } },
        },
    });

    if (!order) return;

    const payload = { orderId: order.id, tableId: order.session?.tableId || null };
    const customerIds = [...new Set(order.orderMembers.map(x => x.customerId).filter(Boolean))];

    for (const customerId of customerIds) {
        sseService.sendToCustomer(customerId, event, payload);
    }

    sseService.sendToBranch(order.branchId, event, payload);
};

const updateTableStatus = async tableId => {
    if (!tableId) return;

    const session = await prisma.diningSession.findFirst({
        where: { tableId: Number(tableId), status: "ACTIVE" },
        include: {
            orders: {
                where: { status: { in: ACTIVE_ORDER_STATUSES } },
            },
        },
    });

    await prisma.table.update({
        where: { id: Number(tableId) },
        data: { status: session?.orders.length ? "OCCUPIED" : "AVAILABLE" },
    });
};

const deleteOrder = async (orderId, user) => {
    const id = Number(orderId);
    if (!Number.isInteger(id)) throw new Error("Order ID không hợp lệ.");

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            session: { select: { id: true, tableId: true } },
            orderMembers: true,
            orderItems: true,
            payment: true,
        },
    });

    if (!order) throw new Error("Đơn hàng không tồn tại.");
    await checkBranchAccess(order.branchId, user);

    const branchId = order.branchId;
    const tableId = order.session?.tableId || null;
    const customerIds = [...new Set(order.orderMembers.map(x => x.customerId).filter(Boolean))];

    await prisma.$transaction(async tx => {
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.orderMember.deleteMany({ where: { orderId: id } });
        await tx.payment.deleteMany({ where: { orderId: id } });
        await tx.order.delete({ where: { id } });

        if (tableId) {
            const activeOrders = await tx.order.count({
                where: {
                    sessionId: order.session?.id,
                    status: { in: ACTIVE_ORDER_STATUSES },
                },
            });

            if (activeOrders === 0) {
                await tx.table.update({
                    where: { id: tableId },
                    data: { status: "AVAILABLE" },
                });
            }
        }
    });

    const payload = { orderId: id, tableId };

    for (const customerId of customerIds) {
        sseService.sendToCustomer(customerId, "order.deleted", payload);
    }

    sseService.sendToBranch(branchId, "order.deleted", payload);

    return { id, deleted: true };
};

const create = async (data, user) => {
    const { customerId, joinOrderId, userId } = data;

    if (!customerId) throw new Error("Vui lòng chọn khách hàng.");

    const customer = await prisma.customer.findUnique({
        where: { id: Number(customerId) },
        include: {
            session: {
                include: {
                    table: { include: { floor: true } },
                },
            },
        },
    });

    if (!customer) throw new Error("Khách hàng không tồn tại.");
    if (!customer.session) throw new Error("Khách chưa thuộc phiên phục vụ.");

    const branchId = customer.session.table.floor.branchId;
    await checkBranchAccess(branchId, user);

    if (joinOrderId) {
        const order = await prisma.order.findUnique({
            where: { id: Number(joinOrderId) },
            include: { orderMembers: true },
        });

        if (!order) throw new Error("Không tìm thấy hóa đơn.");
        await checkBranchAccess(order.branchId, user);

        if (["COMPLETED", "CANCELLED"].includes(order.status)) {
            throw new Error("Hóa đơn đã đóng.");
        }

        if (!order.orderMembers.some(x => x.customerId === customer.id)) {
            await prisma.orderMember.create({
                data: { customerId: customer.id, orderId: order.id },
            });
        }

        return getById(order.id, user);
    }

    const session = customer.session;

    const order = await prisma.order.create({
        data: {
            orderCode: `B-${Date.now()}`,
            branchId,
            sessionId: session.id,
            createdByUserId: Number(userId || user?.id),
            createdByCustomerId: customer.id,
            status: "PENDING",
            orderType: "DINE_IN",
            totalAmount: 0,
        },
    });

    await prisma.orderMember.create({
        data: { customerId: customer.id, orderId: order.id },
    });

    await updateTableStatus(session.tableId);

    await prisma.table.update({
        where: { id: session.tableId },
        data: { status: "OCCUPIED" },
    });

    await notifyOrderCustomers(order.id);

    return getById(order.id, user);
};

const getById = async (id, user) => {
    await checkOrderAccess(id, user);

    const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
            createdByUser: { select: { id: true, username: true } },
            createdByCustomer: { select: { id: true, name: true, phone: true, isGuest: true } },
            session: { include: { table: true } },
            orderItems: { include: { food: true } },
            payment: true,
        },
    });

    if (!order) throw new Error("Đơn hàng không tồn tại.");

    const totalAmount = order.orderItems
        .filter(item => item.status !== "CANCELLED")
        .reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    return {
        ...order,
        customer: order.createdByCustomer || null,
        createdByUser: order.createdByUser
            ? { id: order.createdByUser.id, name: order.createdByUser.username }
            : null,
        totalAmount,
    };
};

const addItem = async (orderId, data, user) => {
    const { foodId, quantity, note } = data;
    if (!foodId) throw new Error("Vui lòng chọn món.");
    if (!quantity || quantity <= 0) throw new Error("Số lượng không hợp lệ.");

    const id = Number(orderId);
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) throw new Error("Đơn hàng không tồn tại.");
    await checkBranchAccess(order.branchId, user);

    if (["COMPLETED", "CANCELLED"].includes(order.status)) {
        throw new Error("Đơn hàng đã đóng.");
    }

    const food = await prisma.food.findUnique({ where: { id: Number(foodId) } });
    if (!food) throw new Error("Món ăn không tồn tại.");

    const branchFood = await prisma.branchFood.findUnique({
        where: {
            branchId_foodId: {
                branchId: order.branchId,
                foodId: Number(foodId),
            },
        },
    });

    if (!branchFood) throw new Error("Chi nhánh chưa có món này.");
    if (branchFood.status === "OUT_OF_STOCK") throw new Error("Món ăn đã hết.");

    const item = await prisma.orderItem.create({
        data: {
            orderId: id,
            foodId: Number(foodId),
            quantity: Number(quantity),
            price: food.price,
            note: note || null,
            status: "PENDING",
        },
        include: { food: true },
    });

    await prisma.order.update({
        where: { id },
        data: { status: "PENDING" },
    });

    await notifyOrderCustomers(id);
    return item;
};

const confirmItems = async (orderId, user) => {
    const id = Number(orderId);
    if (!Number.isInteger(id)) throw new Error("Order ID không hợp lệ.");

    const order = await prisma.order.findUnique({
        where: { id },
        include: { orderItems: true },
    });

    if (!order) throw new Error("Đơn hàng không tồn tại.");
    await checkBranchAccess(order.branchId, user);

    if (["COMPLETED", "CANCELLED"].includes(order.status)) {
        throw new Error("Đơn hàng đã đóng.");
    }

    if (!order.orderItems.some(item => item.status === "PENDING")) {
        throw new Error("Không có món mới cần gửi bếp.");
    }

    const now = new Date();

    await prisma.orderItem.updateMany({
        where: { orderId: id, status: "PENDING" },
        data: {
            status: "PREPARING",
            kitchenStatus: "WAITING",
            kitchenSentAt: now,
        },
    });

    await prisma.order.update({
        where: { id },
        data: { status: "PREPARING" },
    });

    const updatedOrder = await prisma.order.findUnique({
        where: { id },
        include: {
            orderItems: { include: { food: true } },
        },
    });

    if (!updatedOrder) {
        throw new Error("Không thể lấy đơn hàng sau khi gửi bếp.");
    }

    const totalAmount = updatedOrder.orderItems
        .filter(item => item.status !== "CANCELLED")
        .reduce(
            (sum, item) =>
                sum + Number(item.price) * Number(item.quantity),
            0
        );

    await notifyOrderCustomers(id);

    sseService.sendToBranch(order.branchId, "kitchen.updated", {
        type: "ORDER_SENT_TO_KITCHEN",
        orderId: id,
    });

    return { ...updatedOrder, totalAmount };
};

const updateItem = async (itemId, data, user) => {
    const { quantity, note } = data;

    const item = await prisma.orderItem.findUnique({
        where: { id: Number(itemId) },
        include: { order: true },
    });

    if (!item) throw new Error("Món không tồn tại.");
    await checkBranchAccess(item.order.branchId, user);

    if (["COMPLETED", "CANCELLED"].includes(item.order.status)) {
        throw new Error("Đơn hàng đã đóng.");
    }

    if (quantity !== undefined && Number(quantity) <= 0) {
        throw new Error("Số lượng phải lớn hơn 0.");
    }

    if (item.status !== "PENDING") {
        throw new Error("Món đã được bếp xác nhận, không thể chỉnh sửa.");
    }

    const updatedItem = await prisma.orderItem.update({
        where: { id: Number(itemId) },
        data: {
            quantity: quantity !== undefined ? Number(quantity) : item.quantity,
            note: note !== undefined ? note : item.note,
        },
        include: { food: true },
    });

    await notifyOrderCustomers(item.order.id);
    return updatedItem;
};

const removeItem = async (itemId, user) => {
    const item = await prisma.orderItem.findUnique({
        where: { id: Number(itemId) },
        include: {
            order: {
                include: {
                    orderItems: true,
                    orderMembers: true,
                    session: { select: { id: true, tableId: true } },
                },
            },
        },
    });

    if (!item) throw new Error("Món không tồn tại.");

    const order = item.order;
    await checkBranchAccess(order.branchId, user);

    if (["COMPLETED", "CANCELLED"].includes(order.status)) {
        throw new Error("Đơn hàng đã đóng.");
    }

    if (item.status === "CANCELLED") throw new Error("Món này đã được hủy.");
    if (item.status === "SERVED") throw new Error("Món đã được phục vụ, không thể hủy.");

    await prisma.orderItem.update({
        where: { id: Number(itemId) },
        data: { status: "CANCELLED" },
    });

    const remainingItems = order.orderItems.filter(
        x => x.id !== Number(itemId) && x.status !== "CANCELLED"
    );

    if (remainingItems.length === 0) {
        await deleteOrder(order.id, user);
        return { deleted: true, orderId: order.id };
    }

    await notifyOrderCustomers(order.id);
    return true;
};

const updateStatus = async (orderId, status, user) => {
    const id = Number(orderId);
    if (!Number.isInteger(id)) throw new Error("Order ID không hợp lệ.");

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            orderItems: true,
            session: { select: { tableId: true } },
        },
    });

    if (!order) throw new Error("Đơn hàng không tồn tại.");
    await checkBranchAccess(order.branchId, user);

    const allowStatus = [
        "PENDING",
        "PREPARING",
        "SERVED",
        "COMPLETED",
        "CANCELLED",
    ];

    if (!allowStatus.includes(status)) {
        throw new Error("Trạng thái không hợp lệ.");
    }

    if (order.status === "COMPLETED") {
        throw new Error("Đơn hàng đã hoàn thành.");
    }

    if (order.status === "CANCELLED") {
        throw new Error("Đơn hàng đã được hủy.");
    }

    if (status === "PREPARING") {
        if (!order.orderItems.some(item => item.status === "PENDING")) {
            throw new Error("Không có món mới để gửi bếp.");
        }

        const now = new Date();

        await prisma.orderItem.updateMany({
            where: {
                orderId: id,
                status: "PENDING",
            },
            data: {
                status: "PREPARING",
                kitchenStatus: "WAITING",
                kitchenSentAt: now,
            },
        });
    }

    if (status === "SERVED") {
        if (!order.orderItems.some(item => item.status === "PREPARING")) {
            throw new Error("Không có món đang chế biến.");
        }

        await prisma.orderItem.updateMany({
            where: {
                orderId: id,
                status: "PREPARING",
            },
            data: {
                status: "SERVED",
            },
        });
    }

    if (status === "CANCELLED") {
        return deleteOrder(id, user);
    }

    const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
            orderItems: { include: { food: true } },
        },
    });

    if (status === "COMPLETED" && order.session?.tableId) {
        await updateTableStatus(order.session.tableId);
    }

    await notifyOrderCustomers(id);

    sseService.sendToBranch(order.branchId, "order.updated", {
        orderId: id,
        status,
    });

    return updatedOrder;
};

const payment = async (orderId, data, user) => {
    const id = Number(orderId);
    const { paymentMethod, phone } = data;

    if (!Number.isInteger(id)) {
        throw new Error("Order ID không hợp lệ.");
    }

    if (!["CASH", "BANKING"].includes(paymentMethod)) {
        throw new Error("Phương thức thanh toán không hợp lệ.");
    }

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            session: { include: { table: true } },
            createdByCustomer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    isGuest: true,
                },
            },
            orderItems: {
                where: {
                    status: { not: "CANCELLED" },
                },
            },
            payment: true,
        },
    });

    if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
    }

    await checkBranchAccess(order.branchId, user);

    if (["COMPLETED", "CANCELLED"].includes(order.status)) {
        throw new Error("Đơn hàng đã đóng.");
    }

    if (order.orderItems.length === 0) {
        throw new Error("Đơn hàng chưa có món.");
    }

    const unfinished = order.orderItems.find(
        item => item.status !== "SERVED"
    );

    if (unfinished) {
        throw new Error("Vẫn còn món chưa phục vụ.");
    }

    const totalAmount = order.orderItems.reduce(
        (sum, item) =>
            sum + Number(item.price) * Number(item.quantity),
        0
    );

    let customerId = null;

    // Nếu order đã có tài khoản khách hàng thì giữ nguyên,
    // không cho thay đổi bằng số điện thoại khác.
    if (
        order.createdByCustomer &&
        !order.createdByCustomer.isGuest
    ) {
        customerId = order.createdByCustomer.id;
    } else if (
        !order.createdByCustomer &&
        phone?.trim()
    ) {
        const customer = await prisma.customer.findFirst({
            where: {
                phone: phone.trim(),
                isGuest: false,
            },
            select: {
                id: true,
            },
        });

        if (customer) {
            customerId = customer.id;
        }
    }

    const paymentData = {
        paymentMethod,
        cashAmount:
            paymentMethod === "CASH"
                ? totalAmount
                : null,
        bankAmount:
            paymentMethod === "BANKING"
                ? totalAmount
                : null,
        totalAmount,
        paymentStatus: "PAID",
        paidAt: new Date(),
    };

    await prisma.$transaction(async tx => {
        if (order.payment) {
            await tx.payment.update({
                where: {
                    orderId: id,
                },
                data: paymentData,
            });
        } else {
            await tx.payment.create({
                data: {
                    orderId: id,
                    ...paymentData,
                },
            });
        }

        // Chỉ lưu tài khoản khách nếu tìm thấy tài khoản hợp lệ
        if (
            customerId &&
            (!order.createdByCustomer ||
                order.createdByCustomer.isGuest)
        ) {
            await tx.order.update({
                where: { id },
                data: {
                    totalAmount,
                    status: "COMPLETED",
                    createdByCustomerId: customerId,
                },
            });

            const memberExists =
                await tx.orderMember.findFirst({
                    where: {
                        orderId: id,
                        customerId,
                    },
                });

            if (!memberExists) {
                await tx.orderMember.create({
                    data: {
                        orderId: id,
                        customerId,
                    },
                });
            }
        } else {
            await tx.order.update({
                where: { id },
                data: {
                    totalAmount,
                    status: "COMPLETED",
                },
            });
        }

        if (!order.sessionId) return;

        const openOrders = await tx.order.count({
            where: {
                sessionId: order.sessionId,
                status: {
                    in: ACTIVE_ORDER_STATUSES,
                },
            },
        });

        if (openOrders === 0) {
            await tx.diningSession.update({
                where: {
                    id: order.sessionId,
                },
                data: {
                    status: "CLOSED",
                    closedAt: new Date(),
                },
            });

            if (order.session?.tableId) {
                await tx.table.update({
                    where: {
                        id: order.session.tableId,
                    },
                    data: {
                        status: "AVAILABLE",
                    },
                });
            }
        }
    });

    await notifyOrderCustomers(id);

    return {
        orderId: id,
        orderCode: order.orderCode,
        totalAmount,
        paymentMethod,
        paymentStatus: "PAID",
        customerId,
    };
};

const createTakeAway = async (data, user) => {
    if (!user) throw new Error("Chưa xác thực người dùng.");
    if (user.role !== "ADMIN" && !user.branchId) {
        throw new Error("Tài khoản chưa được gán chi nhánh.");
    }

    const branchId = data.branchId ? Number(data.branchId) : Number(user.branchId);
    if (!branchId) throw new Error("Vui lòng chọn chi nhánh.");

    await checkBranchAccess(branchId, user);

    if (!data.items?.length) throw new Error("Đơn hàng chưa có món.");

    const paymentMethod = data.paymentMethod || "CASH";
    if (!["CASH", "BANKING"].includes(paymentMethod)) {
        throw new Error("Phương thức thanh toán không hợp lệ.");
    }

    const foodIds = data.items.map(item => Number(item.foodId));
    const foods = await prisma.food.findMany({
        where: { id: { in: foodIds } },
    });

    if (foods.length !== new Set(foodIds).size) {
        throw new Error("Có món ăn không tồn tại.");
    }

    for (const item of data.items) {
        const foodId = Number(item.foodId);
        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error("Số lượng món không hợp lệ.");
        }

        const branchFood = await prisma.branchFood.findUnique({
            where: { branchId_foodId: { branchId, foodId } },
        });

        if (!branchFood) throw new Error("Chi nhánh chưa có món này.");

        if (branchFood.status === "OUT_OF_STOCK") {
            const food = foods.find(food => food.id === foodId);
            throw new Error(`Món ${food?.name || ""} đã hết.`);
        }
    }

    let customer = null;

    if (data.phone?.trim()) {
        customer = await prisma.customer.findFirst({
            where: { phone: data.phone.trim(), isGuest: false },
        });
    }

    const orderCode = `TA-${Date.now()}`;

    const order = await prisma.$transaction(async tx => {
        const now = new Date();
        let totalAmount = 0;
        const orderItems = [];

        for (const item of data.items) {
            const food = foods.find(food => food.id === Number(item.foodId));
            const price = Number(food.price);
            const quantity = Number(item.quantity);

            totalAmount += price * quantity;

            orderItems.push({
                foodId: food.id,
                quantity,
                price: food.price,
                note: item.note || null,
                status: "CONFIRMED",
                kitchenStatus: "WAITING",
                kitchenSentAt: now,
            });
        }

        const newOrder = await tx.order.create({
            data: {
                orderCode,
                branchId,
                orderType: "TAKE_AWAY",
                status: "PREPARING",
                note: data.note || null,
                totalAmount,
                createdByUserId: Number(user.id),
                ...(customer ? { createdByCustomerId: customer.id } : {}),
                orderItems: { create: orderItems },
            },
        });

        if (customer) {
            await tx.orderMember.create({
                data: { customerId: customer.id, orderId: newOrder.id },
            });
        }

        await tx.payment.create({
            data: {
                orderId: newOrder.id,
                paymentMethod,
                cashAmount: paymentMethod === "CASH" ? totalAmount : null,
                bankAmount: paymentMethod === "BANKING" ? totalAmount : null,
                totalAmount,
                paymentStatus: "PAID",
                paidAt: now,
            },
        });

        return tx.order.findUnique({
            where: { id: newOrder.id },
            include: {
                createdByUser: { select: { id: true, username: true } },
                createdByCustomer: { select: { id: true, name: true, phone: true } },
                orderMembers: { include: { customer: true } },
                orderItems: { include: { food: true } },
                payment: true,
            },
        });
    });

    sseService.sendToBranch(branchId, "kitchen.updated", {
        type: "TAKE_AWAY_CREATED",
        orderId: order.id,
    });

    return order;
};

const getTakeAway = async (user, branchIdParam) => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    let branchId;

    if (user.role === "ADMIN") {
        if (!user.restaurantId) throw new Error("Tài khoản chưa được gán nhà hàng.");
        if (!branchIdParam) throw new Error("Vui lòng chọn chi nhánh.");
        branchId = Number(branchIdParam);
    } else {
        if (!user.branchId) throw new Error("Tài khoản chưa được gán chi nhánh.");
        branchId = Number(user.branchId);
    }

    await checkBranchAccess(branchId, user);

    return prisma.order.findMany({
        where: {
            branchId,
            orderType: "TAKE_AWAY",
            status: "PREPARING",
            payment: { paymentStatus: "PAID" },
        },
        include: {
            createdByUser: { select: { id: true, username: true } },
            createdByCustomer: { select: { id: true, name: true, phone: true } },
            orderMembers: { include: { customer: true } },
            orderItems: {
                where: { status: { not: "CANCELLED" } },
                include: { food: true },
            },
            payment: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

const getHistory = async user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    if (user.role === "ADMIN") {
        if (!user.restaurantId) throw new Error("Tài khoản chưa được gán nhà hàng.");
    } else if (!user.branchId) {
        throw new Error("Tài khoản chưa được gán chi nhánh.");
    }

    const where = user.role === "ADMIN"
        ? {
              status: "COMPLETED",
              branch: { restaurantId: Number(user.restaurantId) },
          }
        : {
              status: "COMPLETED",
              branchId: Number(user.branchId),
          };

    const orders = await prisma.order.findMany({
        where,
        include: {
            createdByUser: { select: { id: true, username: true } },
            createdByCustomer: { select: { id: true, name: true, phone: true } },
            session: {
                include: {
                    table: {
                        select: { id: true, tableNumber: true, qrCode: true },
                    },
                },
            },
            payment: true,
            orderItems: { include: { food: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return orders.map(order => {
        const activeItems = order.orderItems.filter(item => item.status !== "CANCELLED");
        const totalAmount = activeItems.reduce(
            (sum, item) => sum + Number(item.price) * Number(item.quantity),
            0
        );

        return {
            id: order.id,
            orderCode: order.orderCode,
            customer: order.createdByCustomer
                ? {
                      id: order.createdByCustomer.id,
                      name: order.createdByCustomer.name,
                      phone: order.createdByCustomer.phone,
                  }
                : null,
            createdByUser: order.createdByUser
                ? {
                      id: order.createdByUser.id,
                      name: order.createdByUser.username,
                  }
                : null,
            session: order.session || null,
            tableName: order.session?.table?.tableNumber
                ? `Bàn ${order.session.table.tableNumber}`
                : null,
            orderType: order.orderType,
            status: order.status,
            totalItems: activeItems.reduce((sum, item) => sum + Number(item.quantity), 0),
            totalAmount,
            paymentMethod: order.payment?.paymentMethod || null,
            payment: order.payment,
            createdAt: order.createdAt,
            orderItems: order.orderItems,
        };
    });
};

const mergeOrders = async ({
    targetOrderId,
    sourceOrderIds,
    user,
}) => {
    targetOrderId = Number(targetOrderId);
    sourceOrderIds = sourceOrderIds
        .map(Number)
        .filter(id => id !== targetOrderId);

    if (!targetOrderId) {
        throw new Error("Vui lòng chọn đơn chính");
    }

    if (!sourceOrderIds.length) {
        throw new Error(
            "Vui lòng chọn ít nhất một đơn để gộp"
        );
    }

    const result = await prisma.$transaction(
        async tx => {
            const orders =
                await tx.order.findMany({
                    where: {
                        id: {
                            in: [
                                targetOrderId,
                                ...sourceOrderIds,
                            ],
                        },
                    },
                    include: {
                        orderItems: true,
                        orderMembers: true,
                    },
                });

            if (
                orders.length !==
                sourceOrderIds.length + 1
            ) {
                throw new Error(
                    "Có đơn không tồn tại"
                );
            }

            for (const order of orders) {
                await checkBranchAccess(
                    order.branchId,
                    user
                );
            }

            const targetOrder = orders.find(
                order =>
                    order.id ===
                    targetOrderId
            );

            if (!targetOrder) {
                throw new Error(
                    "Không tìm thấy đơn chính"
                );
            }

            if (
                orders.some(order =>
                    [
                        "COMPLETED",
                        "CANCELLED",
                    ].includes(order.status)
                )
            ) {
                throw new Error(
                    "Không thể gộp đơn đã hoàn thành hoặc đã hủy"
                );
            }

            if (
                !orders.every(
                    order =>
                        order.sessionId ===
                        targetOrder.sessionId
                )
            ) {
                throw new Error(
                    "Chỉ có thể gộp các đơn thuộc cùng một bàn"
                );
            }

            await tx.orderItem.updateMany({
                where: {
                    orderId: {
                        in: sourceOrderIds,
                    },
                },
                data: {
                    orderId: targetOrderId,
                },
            });

            for (const sourceOrderId of sourceOrderIds) {
                await tx.orderMember.updateMany({
                    where: {
                        orderId:
                            sourceOrderId,
                    },
                    data: {
                        orderId:
                            targetOrderId,
                    },
                });

                await tx.payment.deleteMany({
                    where: {
                        orderId:
                            sourceOrderId,
                    },
                });

                await tx.order.delete({
                    where: {
                        id: sourceOrderId,
                    },
                });
            }

            const mergedItems =
                await tx.orderItem.findMany({
                    where: {
                        orderId:
                            targetOrderId,
                    },
                });

            const totalAmount =
                mergedItems
                    .filter(
                        item =>
                            item.status !==
                            "CANCELLED"
                    )
                    .reduce(
                        (sum, item) =>
                            sum +
                            Number(
                                item.price
                            ) *
                                Number(
                                    item.quantity
                                ),
                        0
                    );

            return tx.order.update({
                where: {
                    id: targetOrderId,
                },
                data: {
                    totalAmount,
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
                },
            });
        }
    );

    await notifyOrderCustomers(
        targetOrderId
    );

    sseService.sendToBranch(
        result.branchId,
        "order.updated",
        {
            orderId: result.id,
            tableId:
                result.session?.tableId ||
                null,
            status: result.status,
            merged: true,
        }
    );

    return result;
};

const getActiveOrderByTable = async tableQrCode => {
    if (!tableQrCode) throw new Error("Thiếu mã bàn.");

    const table = await prisma.table.findUnique({
        where: { qrCode: tableQrCode },
        include: {
            floor: true,
            sessions: {
                where: { status: "ACTIVE" },
                include: {
                    orders: {
                        where: { status: { in: ACTIVE_ORDER_STATUSES } },
                        orderBy: { createdAt: "asc" },
                        select: {
                            id: true,
                            orderCode: true,
                            totalAmount: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
            },
        },
    });

    if (!table) throw new Error("Bàn không tồn tại.");

    const session = table.sessions[0];
    const tableData = {
        id: table.id,
        tableNumber: table.tableNumber,
        qrCode: table.qrCode,
    };

    if (!session) return { hasActiveOrder: false, table: tableData };

    return {
        hasActiveOrder: session.orders.length > 0,
        table: tableData,
        sessionId: session.id,
        orders: session.orders,
    };
};

const getPendingOrders = async user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    if (user.role === "ADMIN") {
        if (!user.restaurantId) throw new Error("Tài khoản chưa được gán nhà hàng.");
    } else if (!user.branchId) {
        throw new Error("Tài khoản chưa được gán chi nhánh.");
    }

    const where = user.role === "ADMIN"
        ? {
              status: "PENDING",
              orderType: { in: ["DINE_IN", "TAKE_AWAY"] },
              branch: { restaurantId: Number(user.restaurantId) },
          }
        : {
              branchId: Number(user.branchId),
              status: "PENDING",
              orderType: { in: ["DINE_IN", "TAKE_AWAY"] },
          };

    return prisma.order.findMany({
        where,
        include: {
            createdByUser: { select: { id: true, username: true } },
            session: {
                include: {
                    table: {
                        select: { id: true, tableNumber: true, qrCode: true },
                    },
                },
            },
            orderItems: {
                where: { status: "PENDING" },
                include: {
                    food: {
                        select: { id: true, name: true, price: true },
                    },
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });
};

const getCompletedKitchenOrders = async user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    if (user.role === "ADMIN") {
        if (!user.restaurantId) throw new Error("Tài khoản chưa được gán nhà hàng.");
    } else if (!user.branchId) {
        throw new Error("Tài khoản chưa được gán chi nhánh.");
    }

    const where = user.role === "ADMIN"
        ? {
              status: "PREPARING",
              orderType: { in: ["DINE_IN", "TAKE_AWAY"] },
              branch: { restaurantId: Number(user.restaurantId) },
              orderItems: {
                  some: {
                      kitchenStatus: "COMPLETED",
                      status: { not: "CANCELLED" },
                  },
              },
          }
        : {
              branchId: Number(user.branchId),
              status: "PREPARING",
              orderType: { in: ["DINE_IN", "TAKE_AWAY"] },
              orderItems: {
                  some: {
                      kitchenStatus: "COMPLETED",
                      status: { not: "CANCELLED" },
                  },
              },
          };

    return prisma.order.findMany({
        where,
        include: {
            createdByUser: { select: { id: true, username: true } },
            createdByCustomer: { select: { id: true, name: true } },
            session: {
                include: {
                    table: {
                        select: { id: true, tableNumber: true, qrCode: true },
                    },
                },
            },
            orderItems: {
                where: {
                    kitchenStatus: "COMPLETED",
                    status: { not: "CANCELLED" },
                },
                include: {
                    food: {
                        select: { id: true, name: true, price: true },
                    },
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });
};

module.exports = {
    getBranchScope,
    create,
    updateTableStatus,
    notifyOrderCustomers,
    getById,
    addItem,
    confirmItems,
    updateItem,
    removeItem,
    updateStatus,
    payment,
    createTakeAway,
    getTakeAway,
    getHistory,
    mergeOrders,
    getActiveOrderByTable,
    getPendingOrders,
    getCompletedKitchenOrders,
};
