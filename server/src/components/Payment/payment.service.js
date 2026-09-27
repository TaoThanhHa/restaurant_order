const prisma = require("../../config/prisma");

const ACTIVE_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "SERVED"];
const PAYMENT_METHODS = ["CASH", "BANKING", "MIXED"];

const createPaymentCode = orderCode => {
    return String(orderCode || "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
};

const buildVietQRUrl = ({ bankCode, accountNumber, accountName, amount, paymentCode }) => {
    const encodedBankCode = encodeURIComponent(bankCode);
    const encodedAccountNumber = encodeURIComponent(accountNumber);
    const encodedName = encodeURIComponent(accountName || "");
    const encodedInfo = encodeURIComponent(paymentCode || "");

    return `https://img.vietqr.io/image/${encodedBankCode}-${encodedAccountNumber}-compact2.jpg?amount=${Math.round(Number(amount))}&addInfo=${encodedInfo}&accountName=${encodedName}`;
};

const getRestaurantId = user => {
    if (!user?.restaurantId) {
        throw new Error("Không xác định được nhà hàng");
    }

    return Number(user.restaurantId);
};

const getBranchScope = user => {
    if (user?.role === "BRANCH" || user?.role === "CASHIER") {
        if (!user.branchId) {
            throw new Error("Tài khoản chưa được liên kết với chi nhánh");
        }

        return Number(user.branchId);
    }

    return null;
};

const checkBranchAccess = async (branchId, user) => {
    const restaurantId = getRestaurantId(user);
    const scopedBranchId = getBranchScope(user);

    const branch = await prisma.branch.findFirst({
        where: {
            id: Number(branchId),
            restaurantId,
            ...(scopedBranchId ? { id: scopedBranchId } : {}),
        },
        select: {
            id: true,
            name: true,
            restaurantId: true,
        },
    });

    if (!branch) {
        throw new Error("Chi nhánh không thuộc nhà hàng hoặc bạn không có quyền truy cập");
    }

    return branch;
};

const checkOrderAccess = async (orderId, user) => {
    const restaurantId = getRestaurantId(user);
    const scopedBranchId = getBranchScope(user);

    const order = await prisma.order.findUnique({
        where: {
            id: Number(orderId),
        },
        select: {
            id: true,
            orderCode: true,
            status: true,
            orderType: true,
            branchId: true,
            sessionId: true,
            branch: {
                select: {
                    id: true,
                    restaurantId: true,
                },
            },
        },
    });

    if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
    }

    if (order.branch?.restaurantId !== restaurantId) {
        throw new Error("Đơn hàng không thuộc nhà hàng của bạn");
    }

    if (scopedBranchId && order.branchId !== scopedBranchId) {
        throw new Error("Bạn không có quyền truy cập đơn hàng này");
    }

    return order;
};

const calculateOrderTotal = async orderId => {
    const items = await prisma.orderItem.findMany({
        where: {
            orderId: Number(orderId),
            status: {
                not: "CANCELLED",
            },
        },
        select: {
            quantity: true,
            price: true,
        },
    });

    return items.reduce((total, item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
            throw new Error("Giá hoặc số lượng món không hợp lệ.");
        }

        return total + price * quantity;
    }, 0);
};

const getPaymentAccount = async (order, user) => {
    const restaurantId = getRestaurantId(user);
    const scopedBranchId = getBranchScope(user);

    const branchId = scopedBranchId || order.branchId;

    const account = await prisma.paymentAccount.findFirst({
        where: {
            restaurantId,
            isActive: true,
            branches: {
                some: {
                    branchId,
                },
            },
        },
        select: {
            id: true,
            bankCode: true,
            accountNumber: true,
            accountName: true,
            isActive: true,
        },
    });

    if (!account) {
        throw new Error("Chi nhánh chưa có tài khoản ngân hàng thanh toán đang hoạt động");
    }

    return account;
};

const getOrderForPayment = async (orderId, user) => {
    const order = await checkOrderAccess(orderId, user);

    const fullOrder = await prisma.order.findUnique({
        where: {
            id: order.id,
        },
        include: {
            orderItems: {
                where: {
                    status: {
                        not: "CANCELLED",
                    },
                },
                select: {
                    id: true,
                    orderId: true,
                    foodId: true,
                    quantity: true,
                    price: true,
                    status: true,
                    note: true,
                    food: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            payment: true,
        },
    });

    if (!fullOrder) {
        throw new Error("Không tìm thấy thông tin thanh toán.");
    }

    return fullOrder;
};

const completeOrder = async (orderId, user) => {
    const order = await checkOrderAccess(orderId, user);

    if (order.status === "COMPLETED") {
        return true;
    }

    if (order.status === "CANCELLED") {
        throw new Error("Không thể hoàn tất đơn hàng đã huỷ");
    }

    const activeOrders = order.sessionId
        ? await prisma.order.findMany({
              where: {
                  sessionId: order.sessionId,
                  status: {
                      in: ACTIVE_ORDER_STATUSES,
                  },
              },
              select: {
                  id: true,
              },
          })
        : [];

    const otherActiveOrders = activeOrders.filter(item => item.id !== order.id);

    await prisma.order.update({
        where: {
            id: order.id,
        },
        data: {
            status: "COMPLETED",
        },
    });

    if (otherActiveOrders.length === 0 && order.sessionId) {
        const session = await prisma.diningSession.findUnique({
            where: {
                id: order.sessionId,
            },
            select: {
                id: true,
                tableId: true,
                status: true,
            },
        });

        if (session && session.status === "ACTIVE") {
            await prisma.diningSession.update({
                where: {
                    id: session.id,
                },
                data: {
                    status: "CLOSED",
                    closedAt: new Date(),
                },
            });

            if (session.tableId) {
                await prisma.table.update({
                    where: {
                        id: session.tableId,
                    },
                    data: {
                        status: "AVAILABLE",
                    },
                });
            }
        }
    }

    return true;
};

const createPayment = async (orderId, data, user) => {
    const order = await getOrderForPayment(orderId, user);

    if (!ACTIVE_ORDER_STATUSES.includes(order.status)) {
        throw new Error("Đơn hàng không ở trạng thái có thể thanh toán.");
    }

    if (order.payment?.paymentStatus === "PAID") {
        throw new Error("Đơn hàng đã được thanh toán.");
    }

    const items = order.orderItems || [];

    if (!items.length) {
        throw new Error("Đơn hàng không có món để thanh toán.");
    }

    const unservedItems = items.filter(item => item.status !== "SERVED");

    if (unservedItems.length > 0) {
        throw new Error("Chỉ có thể thanh toán khi tất cả món đã phục vụ.");
    }

    const totalAmount = items.reduce((total, item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
            throw new Error("Dữ liệu giá món trong đơn hàng không hợp lệ.");
        }

        return total + price * quantity;
    }, 0);

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        throw new Error("Tổng tiền đơn hàng không hợp lệ.");
    }

    const paymentMethod = String(data?.paymentMethod || "")
        .trim()
        .toUpperCase();

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
        throw new Error("Phương thức thanh toán không hợp lệ.");
    }

    let cashAmount = 0;
    let bankAmount = 0;

    if (paymentMethod === "CASH") {
        cashAmount = totalAmount;
    }

    if (paymentMethod === "BANKING") {
        bankAmount = totalAmount;
    }

    if (paymentMethod === "MIXED") {
        cashAmount = Number(data?.cashAmount || 0);
        bankAmount = Number(data?.bankAmount || 0);

        if (!Number.isFinite(cashAmount) || !Number.isFinite(bankAmount)) {
            throw new Error("Số tiền thanh toán không hợp lệ.");
        }

        if (cashAmount <= 0 || bankAmount <= 0) {
            throw new Error(
                "Thanh toán hỗn hợp phải có cả tiền mặt và chuyển khoản."
            );
        }

        if (Math.abs(cashAmount + bankAmount - totalAmount) > 0.01) {
            throw new Error(
                "Tổng tiền mặt và chuyển khoản không khớp tổng đơn hàng."
            );
        }
    }

    const paymentAccount =
        paymentMethod === "BANKING" || paymentMethod === "MIXED"
            ? await getPaymentAccount(order, user)
            : null;

    const paymentCode = createPaymentCode(order.orderCode);

    const paymentStatus =
        paymentMethod === "CASH"
            ? "PAID"
            : "UNPAID";

    const payment = await prisma.payment.upsert({
        where: {
            orderId: order.id,
        },
        create: {
            orderId: order.id,
            paymentAccountId: paymentAccount?.id || null,
            paymentMethod,
            cashAmount,
            bankAmount,
            paymentCode,
            totalAmount,
            paymentStatus,
            paidAt: paymentStatus === "PAID" ? new Date() : null,
        },
        update: {
            paymentAccountId: paymentAccount?.id || null,
            paymentMethod,
            cashAmount,
            bankAmount,
            paymentCode,
            totalAmount,
            paymentStatus,
            paidAt: paymentStatus === "PAID" ? new Date() : null,
        },
    });

    if (paymentStatus === "PAID") {
        await completeOrder(order.id, user);
    }

    return {
        id: payment.id,
        orderId: payment.orderId,
        orderCode: order.orderCode,
        paymentMethod: payment.paymentMethod,
        cashAmount: Number(payment.cashAmount || 0),
        bankAmount: Number(payment.bankAmount || 0),
        totalAmount: Number(payment.totalAmount),
        paymentStatus: payment.paymentStatus,
        paymentCode: payment.paymentCode,
        paidAt: payment.paidAt,
        paymentAccount: paymentAccount
            ? {
                  id: paymentAccount.id,
                  bankCode: paymentAccount.bankCode,
                  accountNumber: paymentAccount.accountNumber,
                  accountName: paymentAccount.accountName,
              }
            : null,
        qrUrl: paymentAccount && bankAmount > 0
            ? buildVietQRUrl({
                  bankCode: paymentAccount.bankCode,
                  accountNumber: paymentAccount.accountNumber,
                  accountName: paymentAccount.accountName,
                  amount: bankAmount,
                  paymentCode,
              })
            : null,
    };
};

const confirmPayment = async (paymentId, user) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id: Number(paymentId),
        },
        include: {
            order: {
                select: {
                    id: true,
                    orderCode: true,
                    status: true,
                    branchId: true,
                    sessionId: true,
                    orderType: true,
                },
            },
            paymentAccount: true,
        },
    });

    if (!payment) {
        throw new Error("Không tìm thấy giao dịch thanh toán");
    }

    await checkOrderAccess(payment.order.id, user);

    if (payment.paymentStatus === "PAID") {
        return {
            id: payment.id,
            orderId: payment.orderId,
            orderCode: payment.order.orderCode,
            paymentStatus: payment.paymentStatus,
            paymentMethod: payment.paymentMethod,
            totalAmount: payment.totalAmount,
            paidAt: payment.paidAt,
        };
    }

    if (payment.paymentMethod === "CASH") {
        throw new Error("Thanh toán tiền mặt không cần xác nhận chuyển khoản");
    }

    if (
        payment.paymentMethod === "BANKING" &&
        Number(payment.bankAmount || 0) <= 0
    ) {
        throw new Error("Giao dịch chuyển khoản không có số tiền hợp lệ");
    }

    const updatedPayment = await prisma.payment.update({
        where: {
            id: payment.id,
        },
        data: {
            paymentStatus: "PAID",
            paidAt: new Date(),
        },
    });

    await completeOrder(payment.order.id, user);

    return {
        id: updatedPayment.id,
        orderId: updatedPayment.orderId,
        orderCode: payment.order.orderCode,
        orderType: payment.order.orderType,
        paymentMethod: updatedPayment.paymentMethod,
        cashAmount: updatedPayment.cashAmount,
        bankAmount: updatedPayment.bankAmount,
        totalAmount: updatedPayment.totalAmount,
        paymentStatus: updatedPayment.paymentStatus,
        paymentCode: updatedPayment.paymentCode,
        paidAt: updatedPayment.paidAt,
    };
};

const getPaymentById = async (paymentId, user) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id: Number(paymentId),
        },
        include: {
            order: {
                select: {
                    id: true,
                    orderCode: true,
                    status: true,
                    orderType: true,
                    branchId: true,
                    sessionId: true,
                },
            },
            paymentAccount: true,
        },
    });

    if (!payment) {
        throw new Error("Không tìm thấy thanh toán");
    }

    await checkOrderAccess(payment.order.id, user);

    const qrUrl =
        payment.paymentAccount &&
        Number(payment.bankAmount || 0) > 0 &&
        payment.paymentStatus !== "PAID"
            ? buildVietQRUrl({
                  bankCode: payment.paymentAccount.bankCode,
                  accountNumber: payment.paymentAccount.accountNumber,
                  accountName: payment.paymentAccount.accountName,
                  amount: payment.bankAmount,
                  paymentCode: payment.paymentCode,
              })
            : null;

    return {
        id: payment.id,
        orderId: payment.orderId,
        orderCode: payment.order.orderCode,
        orderType: payment.order.orderType,
        paymentMethod: payment.paymentMethod,
        cashAmount: payment.cashAmount,
        bankAmount: payment.bankAmount,
        totalAmount: payment.totalAmount,
        paymentStatus: payment.paymentStatus,
        paymentCode: payment.paymentCode,
        paidAt: payment.paidAt,
        paymentAccount: payment.paymentAccount
            ? {
                  id: payment.paymentAccount.id,
                  bankCode: payment.paymentAccount.bankCode,
                  accountNumber: payment.paymentAccount.accountNumber,
                  accountName: payment.paymentAccount.accountName,
              }
            : null,
        qrUrl,
    };
};

const getPaymentAccounts = async user => {
    const restaurantId = getRestaurantId(user);
    const scopedBranchId = getBranchScope(user);

    const accounts = await prisma.paymentAccount.findMany({
        where: {
            restaurantId,
            ...(scopedBranchId
                ? {
                      branches: {
                          some: {
                              branchId: scopedBranchId,
                          },
                      },
                  }
                : {}),
        },
        include: {
            branches: {
                include: {
                    branch: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return accounts;
};

const createPaymentAccount = async (
    { bankCode, accountNumber, accountName, branchId },
    user
) => {
    const restaurantId = getRestaurantId(user);
    const scopedBranchId = getBranchScope(user);

    if (!bankCode?.trim()) {
        throw new Error("Vui lòng nhập mã ngân hàng");
    }

    if (!accountNumber?.trim()) {
        throw new Error("Vui lòng nhập số tài khoản");
    }

    if (!accountName?.trim()) {
        throw new Error("Vui lòng nhập tên chủ tài khoản");
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId,
        },
        select: {
            id: true,
            mode: true,
        },
    });

    if (!restaurant) {
        throw new Error("Không tìm thấy nhà hàng");
    }

    let finalBranchId = branchId ? Number(branchId) : null;

    if (scopedBranchId) {
        finalBranchId = scopedBranchId;
    }

    if (!finalBranchId) {
        const firstBranch = await prisma.branch.findFirst({
            where: {
                restaurantId,
            },
            select: {
                id: true,
            },
            orderBy: {
                id: "asc",
            },
        });

        if (!firstBranch) {
            throw new Error("Nhà hàng chưa có chi nhánh");
        }

        finalBranchId = firstBranch.id;
    }

    await checkBranchAccess(finalBranchId, user);

    const existing = await prisma.paymentAccount.findFirst({
        where: {
            restaurantId,
            accountNumber: accountNumber.trim(),
        },
        select: {
            id: true,
        },
    });

    if (existing) {
        throw new Error("Số tài khoản này đã tồn tại");
    }

    const account = await prisma.$transaction(async tx => {
        const created = await tx.paymentAccount.create({
            data: {
                restaurantId,
                bankCode: bankCode.trim().toUpperCase(),
                accountNumber: accountNumber.trim(),
                accountName: accountName.trim(),
                isActive: true,
            },
        });

        await tx.branchPaymentAccount.create({
            data: {
                branchId: finalBranchId,
                paymentAccountId: created.id,
            },
        });

        return created;
    });

    return account;
};

const updatePaymentAccount = async (
    accountId,
    { bankCode, accountNumber, accountName, branchId, isActive },
    user
) => {
    const restaurantId = getRestaurantId(user);
    const scopedBranchId = getBranchScope(user);

    const account = await prisma.paymentAccount.findFirst({
        where: {
            id: Number(accountId),
            restaurantId,
            ...(scopedBranchId
                ? {
                      branches: {
                          some: {
                              branchId: scopedBranchId,
                          },
                      },
                  }
                : {}),
        },
        include: {
            branches: true,
        },
    });

    if (!account) {
        throw new Error("Không tìm thấy tài khoản thanh toán");
    }

    if (accountNumber?.trim()) {
        const duplicate = await prisma.paymentAccount.findFirst({
            where: {
                restaurantId,
                accountNumber: accountNumber.trim(),
                id: {
                    not: account.id,
                },
            },
            select: {
                id: true,
            },
        });

        if (duplicate) {
            throw new Error("Số tài khoản này đã tồn tại");
        }
    }

    let finalBranchId = branchId ? Number(branchId) : null;

    if (scopedBranchId) {
        finalBranchId = scopedBranchId;
    }

    if (finalBranchId) {
        await checkBranchAccess(finalBranchId, user);
    }

    const updated = await prisma.$transaction(async tx => {
        const result = await tx.paymentAccount.update({
            where: {
                id: account.id,
            },
            data: {
                ...(bankCode?.trim()
                    ? { bankCode: bankCode.trim().toUpperCase() }
                    : {}),
                ...(accountNumber?.trim()
                    ? { accountNumber: accountNumber.trim() }
                    : {}),
                ...(accountName?.trim()
                    ? { accountName: accountName.trim() }
                    : {}),
                ...(typeof isActive === "boolean" ? { isActive } : {}),
            },
        });

        if (finalBranchId) {
            await tx.branchPaymentAccount.deleteMany({
                where: {
                    paymentAccountId: account.id,
                },
            });

            await tx.branchPaymentAccount.create({
                data: {
                    branchId: finalBranchId,
                    paymentAccountId: account.id,
                },
            });
        }

        return result;
    });

    return updated;
};

const deletePaymentAccount = async (accountId, user) => {
    const restaurantId = getRestaurantId(user);
    const scopedBranchId = getBranchScope(user);

    const account = await prisma.paymentAccount.findFirst({
        where: {
            id: Number(accountId),
            restaurantId,
            ...(scopedBranchId
                ? {
                      branches: {
                          some: {
                              branchId: scopedBranchId,
                          },
                      },
                  }
                : {}),
        },
        select: {
            id: true,
        },
    });

    if (!account) {
        throw new Error("Không tìm thấy tài khoản thanh toán");
    }

    const paymentCount = await prisma.payment.count({
        where: {
            paymentAccountId: account.id,
        },
    });

    if (paymentCount > 0) {
        throw new Error(
            "Không thể xoá tài khoản đã phát sinh giao dịch thanh toán. Hãy tắt hoạt động thay vì xoá."
        );
    }

    await prisma.paymentAccount.delete({
        where: {
            id: account.id,
        },
    });

    return true;
};

const togglePaymentAccount = async (accountId, isActive, user) => {
    const restaurantId = getRestaurantId(user);
    const scopedBranchId = getBranchScope(user);

    const account = await prisma.paymentAccount.findFirst({
        where: {
            id: Number(accountId),
            restaurantId,
            ...(scopedBranchId
                ? {
                      branches: {
                          some: {
                              branchId: scopedBranchId,
                          },
                      },
                  }
                : {}),
        },
        select: {
            id: true,
        },
    });

    if (!account) {
        throw new Error("Không tìm thấy tài khoản thanh toán");
    }

    if (typeof isActive !== "boolean") {
        throw new Error("isActive phải là boolean");
    }

    return prisma.paymentAccount.update({
        where: {
            id: account.id,
        },
        data: {
            isActive,
        },
    });
};

module.exports = {
    createPayment,
    confirmPayment,
    getPaymentById,
    getPaymentAccounts,
    createPaymentAccount,
    updatePaymentAccount,
    deletePaymentAccount,
    togglePaymentAccount,
};