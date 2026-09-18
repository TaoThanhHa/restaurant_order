const prisma = require("../../config/prisma");

const REMINDER_MINUTES = 10;
const NO_SHOW_MINUTES = 15;

const ACTIVE_RESERVATION_STATUSES = ["PENDING", "CONFIRMED"];

const isReservationManager = role =>
    ["ADMIN", "BRANCH"].includes(role);

const isReservationStaff = role =>
    ["ADMIN", "BRANCH", "CASHIER"].includes(role);

const getAdminSingleBranch = async user => {
    if (!user?.restaurantId) {
        throw new Error("Tài khoản chưa thuộc nhà hàng.");
    }

    const branches = await prisma.branch.findMany({
        where: {
            restaurantId: Number(user.restaurantId),
        },
        select: {
            id: true,
        },
        orderBy: {
            id: "asc",
        },
    });

    if (branches.length === 0) {
        throw new Error("Nhà hàng chưa có chi nhánh.");
    }

    if (branches.length > 1) {
        throw new Error(
            "Chức năng đặt bàn chỉ được sử dụng ở nhà hàng một chi nhánh."
        );
    }

    return branches[0].id;
};

const getScope = async user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    if (user.role === "ADMIN") {
        return {
            branchId: await getAdminSingleBranch(user),
        };
    }

    if (["BRANCH", "CASHIER"].includes(user.role)) {
        if (!user.branchId) {
            throw new Error("Tài khoản chưa thuộc chi nhánh.");
        }

        return {
            branchId: Number(user.branchId),
        };
    }

    throw new Error("Bạn không có quyền thực hiện thao tác này.");
};

const requireReservationManager = async user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    if (user.role === "ADMIN") {
        await getAdminSingleBranch(user);
        return;
    }

    if (user.role === "BRANCH") {
        if (!user.branchId) {
            throw new Error("Tài khoản chưa thuộc chi nhánh.");
        }

        return;
    }

    throw new Error("Bạn không có quyền quản lý đặt bàn.");
};

const requireReservationStaff = async user => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    if (user.role === "ADMIN") {
        await getAdminSingleBranch(user);
        return;
    }

    if (["BRANCH", "CASHIER"].includes(user.role)) {
        if (!user.branchId) {
            throw new Error("Tài khoản chưa thuộc chi nhánh.");
        }

        return;
    }

    throw new Error("Bạn không có quyền thực hiện thao tác này.");
};

const checkBranchAccess = async (branchId, user) => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    const id = Number(branchId);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Chi nhánh không hợp lệ.");
    }

    const branch = await prisma.branch.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            restaurantId: true,
            isActive: true,
        },
    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

    if (user.role === "ADMIN") {
        const adminBranchId = await getAdminSingleBranch(user);

        if (Number(adminBranchId) !== Number(branch.id)) {
            throw new Error(
                "Bạn không có quyền truy cập chi nhánh này."
            );
        }
    } else if (["BRANCH", "CASHIER"].includes(user.role)) {
        if (Number(user.branchId) !== Number(branch.id)) {
            throw new Error(
                "Bạn không có quyền truy cập chi nhánh này."
            );
        }
    } else {
        throw new Error("Bạn không có quyền thực hiện thao tác này.");
    }

    return branch;
};

const getReservation = async (id, user) => {
    await requireReservationStaff(user);

    const reservation = await prisma.reservation.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            branch: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            tables: {
                include: {
                    table: {
                        include: {
                            floor: true,
                        },
                    },
                },
            },
            sessions: {
                select: {
                    id: true,
                    status: true,
                    startedAt: true,
                    closedAt: true,
                },
            },
        },
    });

    if (!reservation) {
        throw new Error("Không tìm thấy đặt bàn.");
    }

    await checkBranchAccess(reservation.branchId, user);

    return reservation;
};

const isOverlapping = (timeA, timeB) => {
    return (
        new Date(timeA).getTime() ===
        new Date(timeB).getTime()
    );
};

const validatePositiveInt = (value, message) => {
    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        throw new Error(message);
    }

    return number;
};

const create = async (data, user) => {
    await requireReservationManager(user);

    const {
        branchId,
        customerName,
        customerPhone,
        numberOfGuests,
        reservationTime,
        note,
    } = data;

    let targetBranchId;

    if (user.role === "ADMIN") {
        targetBranchId = await getAdminSingleBranch(user);
    } else {
        targetBranchId = Number(user.branchId);
    }

    const branch = await checkBranchAccess(targetBranchId, user);

    if (!branch.isActive) {
        throw new Error("Chi nhánh đang tạm ngưng hoạt động.");
    }

    if (!customerName?.trim()) {
        throw new Error("Vui lòng nhập tên khách hàng.");
    }

    if (!customerPhone?.trim()) {
        throw new Error("Vui lòng nhập số điện thoại.");
    }

    const guests = validatePositiveInt(
        numberOfGuests,
        "Số lượng khách không hợp lệ."
    );

    if (!reservationTime) {
        throw new Error("Vui lòng chọn thời gian đặt bàn.");
    }

    const time = new Date(reservationTime);

    if (Number.isNaN(time.getTime())) {
        throw new Error("Thời gian đặt bàn không hợp lệ.");
    }

    if (time <= new Date()) {
        throw new Error("Thời gian đặt bàn phải ở tương lai.");
    }

    return prisma.reservation.create({
        data: {
            restaurantId: Number(branch.restaurantId),
            branchId: Number(branch.id),
            createdById: Number(user.id),
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            numberOfGuests: guests,
            reservationTime: time,
            note: note?.trim() || null,
        },
        include: {
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });
};

const getAll = async (user, filters = {}) => {
    const scope = await getScope(user);
    const where = {
        ...scope,
    };

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.date) {
        const start = new Date(filters.date);

        if (Number.isNaN(start.getTime())) {
            throw new Error("Ngày lọc không hợp lệ.");
        }

        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        where.reservationTime = {
            gte: start,
            lt: end,
        };
    }

    if (filters.from || filters.to) {
        where.reservationTime = {};

        if (filters.from) {
            const from = new Date(filters.from);

            if (Number.isNaN(from.getTime())) {
                throw new Error("Thời gian bắt đầu không hợp lệ.");
            }

            where.reservationTime.gte = from;
        }

        if (filters.to) {
            const to = new Date(filters.to);

            if (Number.isNaN(to.getTime())) {
                throw new Error("Thời gian kết thúc không hợp lệ.");
            }

            where.reservationTime.lte = to;
        }
    }

    return prisma.reservation.findMany({
        where,
        include: {
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    username: true,
                },
            },
            tables: {
                include: {
                    table: {
                        select: {
                            id: true,
                            tableNumber: true,
                            capacity: true,
                            floor: {
                                select: {
                                    id: true,
                                    floorNumber: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            reservationTime: "asc",
        },
    });
};

const update = async (id, data, user) => {
    await requireReservationManager(user);

    const reservation = await getReservation(id, user);

    if (!ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) {
        throw new Error(
            "Không thể chỉnh sửa đặt bàn ở trạng thái hiện tại."
        );
    }

    const updateData = {};

    if (data.customerName !== undefined) {
        if (!data.customerName?.trim()) {
            throw new Error("Tên khách hàng không hợp lệ.");
        }

        updateData.customerName = data.customerName.trim();
    }

    if (data.customerPhone !== undefined) {
        if (!data.customerPhone?.trim()) {
            throw new Error("Số điện thoại không hợp lệ.");
        }

        updateData.customerPhone = data.customerPhone.trim();
    }

    if (data.numberOfGuests !== undefined) {
        updateData.numberOfGuests = validatePositiveInt(
            data.numberOfGuests,
            "Số lượng khách không hợp lệ."
        );
    }

    if (data.reservationTime !== undefined) {
        const time = new Date(data.reservationTime);

        if (
            Number.isNaN(time.getTime()) ||
            time <= new Date()
        ) {
            throw new Error("Thời gian đặt bàn không hợp lệ.");
        }

        updateData.reservationTime = time;
    }

    if (data.note !== undefined) {
        updateData.note = data.note?.trim() || null;
    }

    const nextReservation = {
        ...reservation,
        reservationTime:
            updateData.reservationTime ||
            reservation.reservationTime,
        numberOfGuests:
            updateData.numberOfGuests ||
            reservation.numberOfGuests,
    };

    if (reservation.tables.length > 0) {
        const tableIds = reservation.tables.map(
            item => item.tableId
        );

        const conflicts =
            await prisma.reservationTable.findMany({
                where: {
                    tableId: {
                        in: tableIds,
                    },
                    reservationId: {
                        not: reservation.id,
                    },
                    reservation: {
                        status: {
                            in: ACTIVE_RESERVATION_STATUSES,
                        },
                    },
                },
                include: {
                    reservation: {
                        select: {
                            id: true,
                            customerName: true,
                            reservationTime: true,
                        },
                    },
                },
            });

        for (const item of conflicts) {
            const conflict = item.reservation;

            if (
                isOverlapping(
                    nextReservation.reservationTime,
                    conflict.reservationTime
                )
            ) {
                throw new Error(
                    `Bàn đã được đặt bởi khách ${conflict.customerName}.`
                );
            }
        }

        for (const item of reservation.tables) {
            if (
                item.table.capacity <
                nextReservation.numberOfGuests
            ) {
                throw new Error(
                    `Bàn ${item.table.tableNumber} không đủ sức chứa cho số lượng khách mới.`
                );
            }
        }
    }

    return prisma.reservation.update({
        where: {
            id: reservation.id,
        },
        data: updateData,
        include: {
            tables: {
                include: {
                    table: {
                        include: {
                            floor: true,
                        },
                    },
                },
            },
        },
    });
};

const cancel = async (id, user) => {
    await requireReservationManager(user);

    const reservation = await getReservation(id, user);

    if (
        ["CANCELLED", "COMPLETED", "NO_SHOW"].includes(
            reservation.status
        )
    ) {
        throw new Error(
            "Đặt bàn đã kết thúc hoặc đã bị hủy."
        );
    }

    return prisma.reservation.update({
        where: {
            id: reservation.id,
        },
        data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
        },
        include: {
            tables: {
                include: {
                    table: true,
                },
            },
        },
    });
};

const getAvailableTables = async (reservationId, user) => {
    await requireReservationStaff(user);

    const reservation = await getReservation(
        reservationId,
        user
    );

    if (
        ["CANCELLED", "COMPLETED", "NO_SHOW"].includes(
            reservation.status
        )
    ) {
        throw new Error("Đặt bàn không còn hiệu lực.");
    }

    const tables = await prisma.table.findMany({
        where: {
            floor: {
                branchId: reservation.branchId,
            },
            status: {
                not: "DISABLED",
            },
            capacity: {
                gte: reservation.numberOfGuests,
            },
        },
        include: {
            floor: {
                select: {
                    id: true,
                    floorNumber: true,
                    name: true,
                },
            },
            sessions: {
                where: {
                    status: "ACTIVE",
                },
                select: {
                    id: true,
                    startedAt: true,
                },
            },
            reservations: {
                where: {
                    reservationId: {
                        not: reservation.id,
                    },
                    reservation: {
                        status: {
                            in: ACTIVE_RESERVATION_STATUSES,
                        },
                    },
                },
                include: {
                    reservation: {
                        select: {
                            id: true,
                            customerName: true,
                            reservationTime: true,
                            status: true,
                        },
                    },
                },
            },
        },
        orderBy: [
            {
                floorId: "asc",
            },
            {
                tableNumber: "asc",
            },
        ],
    });

    return tables.map(table => {
        const conflictReservations =
            table.reservations
                .map(item => item.reservation)
                .filter(other =>
                    isOverlapping(
                        reservation.reservationTime,
                        other.reservationTime
                    )
                );

        const occupied = table.sessions.length > 0;

        return {
            id: table.id,
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            status: table.status,
            floor: table.floor,
            occupied,
            conflictReservations,
            availableForReservation:
                conflictReservations.length === 0,
            availableNow:
                !occupied &&
                conflictReservations.length === 0,
            warning:
                occupied &&
                conflictReservations.length === 0
                    ? "Bàn hiện đang có khách nhưng có thể gán cho đặt bàn trong tương lai."
                    : null,
        };
    });
};

const assignTable = async (id, tableId, user) => {
    await requireReservationStaff(user);

    const reservation = await getReservation(id, user);

    if (!ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) {
        throw new Error(
            "Không thể gán bàn cho đặt bàn này."
        );
    }

    const table = await prisma.table.findUnique({
        where: {
            id: Number(tableId),
        },
        include: {
            floor: true,
        },
    });

    if (!table) {
        throw new Error("Bàn không tồn tại.");
    }

    if (
        Number(table.floor.branchId) !==
        Number(reservation.branchId)
    ) {
        throw new Error(
            "Bàn không thuộc chi nhánh của đặt bàn."
        );
    }

    if (table.status === "DISABLED") {
        throw new Error("Bàn đang ngưng sử dụng.");
    }

    if (table.capacity < reservation.numberOfGuests) {
        throw new Error(
            "Bàn không đủ sức chứa cho số lượng khách."
        );
    }

    const conflicts =
        await prisma.reservationTable.findMany({
            where: {
                tableId: table.id,
                reservationId: {
                    not: reservation.id,
                },
                reservation: {
                    status: {
                        in: ACTIVE_RESERVATION_STATUSES,
                    },
                },
            },
            include: {
                reservation: {
                    select: {
                        id: true,
                        customerName: true,
                        reservationTime: true,
                        status: true,
                    },
                },
            },
        });

    const conflict = conflicts.find(item =>
        isOverlapping(
            reservation.reservationTime,
            item.reservation.reservationTime
        )
    );

    if (conflict) {
        throw new Error(
            `Bàn đã được đặt bởi khách ${conflict.reservation.customerName}.`
        );
    }

    return prisma.$transaction(async tx => {
        await tx.reservationTable.deleteMany({
            where: {
                reservationId: reservation.id,
            },
        });

        await tx.reservationTable.create({
            data: {
                reservationId: reservation.id,
                tableId: table.id,
            },
        });

        return tx.reservation.update({
            where: {
                id: reservation.id,
            },
            data: {
                status: "CONFIRMED",
            },
            include: {
                tables: {
                    include: {
                        table: {
                            include: {
                                floor: true,
                            },
                        },
                    },
                },
            },
        });
    });
};

const remind = async (id, user) => {
    await requireReservationManager(user);

    const reservation = await getReservation(id, user);

    if (reservation.status !== "CONFIRMED") {
        throw new Error(
            "Chỉ có thể nhắc khách với đặt bàn đã xác nhận."
        );
    }

    if (reservation.reminderCalledAt) {
        throw new Error(
            `Đã gọi nhắc khách lúc ${reservation.reminderCalledAt.toLocaleString("vi-VN")}.`
        );
    }

    const now = new Date();

    if (now < reservation.reservationTime) {
        throw new Error("Chưa đến thời gian đặt bàn.");
    }

    const minutesLate = Math.floor(
        (now.getTime() -
            reservation.reservationTime.getTime()) /
            60000
    );

    if (minutesLate < REMINDER_MINUTES) {
        throw new Error(
            `Chưa đến thời điểm gọi nhắc khách (${REMINDER_MINUTES} phút).`
        );
    }

    return prisma.reservation.update({
        where: {
            id: reservation.id,
        },
        data: {
            reminderCalledAt: now,
        },
    });
};

const checkIn = async (id, user) => {
    await requireReservationStaff(user);

    const reservation = await getReservation(id, user);

    if (reservation.status !== "CONFIRMED") {
        throw new Error(
            "Đặt bàn chưa được xác nhận hoặc không còn hiệu lực."
        );
    }

    const table = reservation.tables[0]?.table;

    if (!table) {
        throw new Error("Đặt bàn chưa được gán bàn.");
    }

    if (table.status === "DISABLED") {
        throw new Error("Bàn đang ngưng sử dụng.");
    }

    const existingSession =
        await prisma.diningSession.findFirst({
            where: {
                tableId: table.id,
                status: "ACTIVE",
            },
        });

    if (existingSession) {
        throw new Error(
            "Bàn hiện đang có khách. Vui lòng xử lý khách hiện tại trước khi check-in."
        );
    }

    return prisma.$transaction(async tx => {
        const session =
            await tx.diningSession.create({
                data: {
                    tableId: table.id,
                    reservationId: reservation.id,
                    status: "ACTIVE",
                },
            });

        await tx.reservation.update({
            where: {
                id: reservation.id,
            },
            data: {
                status: "CHECKED_IN",
                checkedInAt: new Date(),
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

        return session;
    });
};

const complete = async (id, user) => {
    await requireReservationStaff(user);

    const reservation = await getReservation(id, user);

    if (reservation.status !== "CHECKED_IN") {
        throw new Error(
            "Đặt bàn chưa ở trạng thái đang phục vụ."
        );
    }

    return prisma.$transaction(async tx => {
        const session =
            await tx.diningSession.findFirst({
                where: {
                    reservationId: reservation.id,
                    status: "ACTIVE",
                },
            });

        if (session) {
            await tx.diningSession.update({
                where: {
                    id: session.id,
                },
                data: {
                    status: "CLOSED",
                    closedAt: new Date(),
                },
            });

            await tx.table.update({
                where: {
                    id: session.tableId,
                },
                data: {
                    status: "AVAILABLE",
                },
            });
        }

        return tx.reservation.update({
            where: {
                id: reservation.id,
            },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });
    });
};

const processNoShows = async () => {
    const now = new Date();

    const deadline = new Date(
        now.getTime() -
            NO_SHOW_MINUTES * 60 * 1000
    );

    const reservations =
        await prisma.reservation.findMany({
            where: {
                status: "CONFIRMED",
                reservationTime: {
                    lte: deadline,
                },
            },
            include: {
                tables: true,
            },
        });

    let count = 0;

    for (const reservation of reservations) {
        const hasActiveSession =
            await prisma.diningSession.findFirst({
                where: {
                    reservationId: reservation.id,
                    status: "ACTIVE",
                },
                select: {
                    id: true,
                },
            });

        if (hasActiveSession) {
            continue;
        }

        await prisma.$transaction(async tx => {
            await tx.reservation.update({
                where: {
                    id: reservation.id,
                },
                data: {
                    status: "NO_SHOW",
                    noShowAt: now,
                },
            });

            for (const item of reservation.tables) {
                const table =
                    await tx.table.findUnique({
                        where: {
                            id: item.tableId,
                        },
                        select: {
                            id: true,
                            status: true,
                            sessions: {
                                where: {
                                    status: "ACTIVE",
                                },
                                select: {
                                    id: true,
                                },
                            },
                        },
                    });

                if (
                    table &&
                    table.status !== "DISABLED" &&
                    table.sessions.length === 0
                ) {
                    await tx.table.update({
                        where: {
                            id: table.id,
                        },
                        data: {
                            status: "AVAILABLE",
                        },
                    });
                }
            }
        });

        count++;
    }

    return { count };
};

module.exports = {
    create,
    getAll,
    getReservation,
    update,
    cancel,
    getAvailableTables,
    assignTable,
    remind,
    checkIn,
    complete,
    processNoShows,
};