const prisma = require("../../config/prisma");

const sseService = require("../../services/sse.service");
// ========================================
// KHÁCH GỬI YÊU CẦU
// ========================================

const create = async ({
    qrCode,
    customerId,
    message,
}) => {

    if (!qrCode) {
        throw new Error(
            "Không xác định được mã QR của bàn."
        );
    }

    if (!message?.trim()) {
        throw new Error(
            "Vui lòng nhập nội dung yêu cầu."
        );
    }

    // ----------------------------------------
    // TÌM BÀN
    // ----------------------------------------

    const table = await prisma.table.findUnique({
        where: {
            qrCode,
        },
        include: {
            floor: true,
        },
    });

    if (!table) {
        throw new Error(
            "Không tìm thấy bàn."
        );
    }

    // ----------------------------------------
    // KIỂM TRA YÊU CẦU ĐANG CHỜ
    // ----------------------------------------

    const existing =
        await prisma.serviceRequest.findFirst({
            where: {
                tableId: table.id,
                status: {
                    in: [
                        "PENDING",
                        "ACCEPTED",
                    ],
                },
            },
        });

    if (existing) {
        throw new Error(
            "Bàn này đang có một yêu cầu chưa được xử lý."
        );
    }

    // ----------------------------------------
    // TẠO YÊU CẦU
    // ----------------------------------------

    const request =
        await prisma.serviceRequest.create({
            data: {
                branchId: table.floor.branchId,
                tableId: table.id,
                customerId: customerId || null,
                message: message.trim(),
            },

            include: {
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                        qrCode: true,
                    },
                },
            },
        });
        // ======================================================
// SSE
// ======================================================

// Báo cho cashier/branch
sseService.sendToBranch(
    table.floor.branchId,
    "service-request.created",
    {
        requestId: request.id,
        tableId: request.tableId,
        status: request.status,
    }
);


// Báo lại cho customer
if (customerId) {

    sseService.sendToCustomer(
        customerId,
        "service-request.updated",
        {
            requestId: request.id,
            status: request.status,
        }
    );

}

    return request;
};


// ========================================
// BRANCH LẤY YÊU CẦU
// ========================================

const getAll = async (branchId) => {

    return prisma.serviceRequest.findMany({

        where: {
            branchId,
            status: {
                in: [
                    "PENDING",
                    "ACCEPTED",
                ],
            },
        },

        include: {

            table: {
                select: {
                    id: true,
                    tableNumber: true,
                    qrCode: true,
                },
            },

            customer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },

            handledBy: {
                select: {
                    id: true,
                    username: true,
                },
            },

        },

        orderBy: {
            createdAt: "asc",
        },

    });

};


// ========================================
// BRANCH XÁC NHẬN
// ========================================

const accept = async ({
    id,
    userId,
    branchId,
}) => {

    const request =
        await prisma.serviceRequest.findFirst({

            where: {
                id,
                branchId,
            },

        });

    if (!request) {
        throw new Error(
            "Không tìm thấy yêu cầu."
        );
    }

    if (request.status !== "PENDING") {
        throw new Error(
            "Yêu cầu này đã được xử lý."
        );
    }

    const updated =
    await prisma.serviceRequest.update({

        where: {
            id,
        },

        data: {
            status: "ACCEPTED",
            handledById: userId,
            handledAt: new Date(),
        },

        include: {
            table: true,
        },

    });
    // ======================================================
// SSE
// ======================================================

sseService.sendToBranch(
    branchId,
    "service-request.updated",
    {
        requestId: updated.id,
        tableId: updated.tableId,
        status: updated.status,
    }
);


// Lấy customer
if (updated.customerId) {

    sseService.sendToCustomer(
        updated.customerId,
        "service-request.updated",
        {
            requestId: updated.id,
            status: updated.status,
        }
    );

}


return updated;

};


// ========================================
// HOÀN THÀNH
// ========================================

const complete = async ({
    id,
    branchId,
}) => {

    const request =
        await prisma.serviceRequest.findFirst({

            where: {
                id,
                branchId,
            },

        });

    if (!request) {
        throw new Error(
            "Không tìm thấy yêu cầu."
        );
    }

    const updated =
    await prisma.serviceRequest.update({

        where: {
            id,
        },

        data: {
            status: "COMPLETED",
        },

    });
    sseService.sendToBranch(
    branchId,
    "service-request.updated",
    {
        requestId: updated.id,
        tableId: updated.tableId,
        status: updated.status,
    }
);


if (updated.customerId) {

    sseService.sendToCustomer(
        updated.customerId,
        "service-request.updated",
        {
            requestId: updated.id,
            status: updated.status,
        }
    );

}


return updated;

};


// ========================================
// LẤY TRẠNG THÁI YÊU CẦU
// ========================================

const getStatus = async (id) => {

    const request =
        await prisma.serviceRequest.findUnique({

            where: {
                id,
            },

            select: {
                id: true,
                tableId: true,
                message: true,
                status: true,
                handledById: true,
                handledAt: true,
                createdAt: true,
                updatedAt: true,

                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                        qrCode: true,
                    },
                },

            },

        });

    if (!request) {

        throw new Error(
            "Không tìm thấy yêu cầu."
        );

    }

    return request;
};


// ========================================
// KHÁCH XEM YÊU CẦU CỦA MÌNH
// ========================================

const getCustomerRequests = async ({
    customerId,
    tableId,
}) => {

    return prisma.serviceRequest.findMany({

        where: {
            customerId,
            tableId,
        },

        orderBy: {
            createdAt: "desc",
        },

        take: 10,

    });

};


module.exports = {
    create,
    getAll,
    accept,
    complete,
    getStatus,
    getCustomerRequests,
};