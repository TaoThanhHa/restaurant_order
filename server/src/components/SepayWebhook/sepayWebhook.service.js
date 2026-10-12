
const prisma = require("../../config/prisma");

const normalizeCode = value =>
    String(value || "").replace(/\s+/g, "").toUpperCase();

const getPaymentCode = payload => {
    const code = String(payload.code || "").trim();

    if (code) {
        return normalizeCode(code);
    }

    const content = normalizeCode(payload.content);
    if (!content) return "";

    return content;
};

const completeOrderInTransaction = async (tx, order) => {
    if (order.status === "CANCELLED") {
        throw new Error("Không thể hoàn tất đơn hàng đã huỷ.");
    }

    if (order.status !== "COMPLETED") {
        await tx.order.update({
            where: { id: order.id },
            data: { status: "COMPLETED" },
        });
    }

    if (!order.sessionId) return;

    const activeOrders = await tx.order.findMany({
        where: {
            sessionId: order.sessionId,
            id: { not: order.id },
            status: {
                in: ["PENDING", "CONFIRMED", "PREPARING", "SERVED"],
            },
        },
        select: { id: true },
    });

    if (activeOrders.length > 0) return;

    const session = await tx.diningSession.findUnique({
        where: { id: order.sessionId },
        select: {
            id: true,
            tableId: true,
            status: true,
        },
    });

    if (!session || session.status !== "ACTIVE") return;

    await tx.diningSession.update({
        where: { id: session.id },
        data: {
            status: "CLOSED",
            closedAt: new Date(),
        },
    });

    if (session.tableId) {
        await tx.table.update({
            where: { id: session.tableId },
            data: { status: "AVAILABLE" },
        });
    }
};

const processWebhook = async payload => {
    const sepayId = payload?.id;
    const transferType = String(payload?.transferType || "").toLowerCase();
    const accountNumber = String(payload?.accountNumber || "").trim();
    const transferAmount = Number(payload?.transferAmount);
    const paymentCode = getPaymentCode(payload);

    if (
        sepayId === undefined ||
        sepayId === null ||
        !/^\d+$/.test(String(sepayId))
    ) {
        throw new Error("Mã giao dịch SePay không hợp lệ.");
    }

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
        throw new Error("Số tiền giao dịch không hợp lệ.");
    }

    if (transferType !== "in") {
        return {
            processed: false,
            reason: "NOT_INCOMING_TRANSFER",
        };
    }

    if (!accountNumber) {
        throw new Error("Thiếu số tài khoản nhận tiền.");
    }

    const transactionId = BigInt(sepayId);

    try {
        return await prisma.$transaction(async tx => {
            const candidates = paymentCode
                ? await tx.payment.findMany({
                      where: {
                          paymentStatus: "UNPAID",
                          paymentMethod: "BANKING",
                      },
                      include: {
                          order: {
                              select: {
                                  id: true,
                                  orderCode: true,
                                  status: true,
                                  sessionId: true,
                                  branchId: true,
                                  orderItems: {
                                      select: { status: true },
                                  },
                              },
                          },
                          paymentAccount: {
                              select: {
                                  id: true,
                                  accountNumber: true,
                              },
                          },
                      },
                  })
                : [];

            const payment = candidates.find(item => {
                const savedCode = normalizeCode(item.paymentCode);
                return (
                    savedCode &&
                    (paymentCode === savedCode ||
                        paymentCode.includes(savedCode))
                );
            });

            let processingStatus = "UNMATCHED";
            let paymentId = null;

            if (payment) {
                paymentId = payment.id;

                if (
                    String(payment.paymentAccount?.accountNumber || "").trim() !==
                    accountNumber
                ) {
                    processingStatus = "ACCOUNT_MISMATCH";
                } else if (
                    Math.abs(
                        transferAmount - Number(payment.bankAmount || 0)
                    ) > 0.009
                ) {
                    processingStatus = "AMOUNT_MISMATCH";
                } else if (payment.order.status === "CANCELLED") {
                    processingStatus = "ORDER_CANCELLED";
                } else {
                    processingStatus = "PAID";
                }
            }

            await tx.sePayTransaction.create({
                data: {
                    sepayId: transactionId,
                    paymentId,
                    accountNumber,
                    transferType,
                    transferAmount,
                    paymentCode: paymentCode || null,
                    content: String(payload.content || ""),
                    referenceCode: payload.referenceCode
                        ? String(payload.referenceCode)
                        : null,
                    processingStatus,
                    rawPayload: payload,
                },
            });

            if (processingStatus !== "PAID" || !payment) {
                return {
                    processed: false,
                    reason: processingStatus,
                    paymentId,
                };
            }

            const updated = await tx.payment.updateMany({
                where: {
                    id: payment.id,
                    paymentStatus: "UNPAID",
                },
                data: {
                    paymentStatus: "PAID",
                    paidAt: new Date(),
                },
            });

            if (updated.count === 0) {
                await tx.sePayTransaction.update({
                    where: { sepayId: transactionId },
                    data: { processingStatus: "ALREADY_PAID" },
                });

                return {
                    processed: false,
                    reason: "ALREADY_PAID",
                    paymentId: payment.id,
                };
            }

            await completeOrderInTransaction(tx, payment.order);

            return {
                processed: true,
                reason: "PAID",
                paymentId: payment.id,
                orderId: payment.order.id,
                orderCode: payment.order.orderCode,
            };
        });
    } catch (error) {
        if (error.code === "P2002") {
            return {
                processed: false,
                reason: "DUPLICATE_TRANSACTION",
            };
        }

        throw error;
    }
};

module.exports = {
    processWebhook,
};
