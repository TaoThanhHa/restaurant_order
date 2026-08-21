const bcrypt = require("bcrypt");
const prisma = require("../../config/prisma");

const {
    generateCustomerToken,
} = require("../../utils/jwtCustomer");

const { v4: uuidv4 } = require("uuid");


// ======================================================
// HELPER: LẤY THÔNG TIN BÀN
// ======================================================

const getTableInfo = async (tx, tableId) => {

    if (!tableId) {
        throw new Error("Thiếu mã QR của bàn.");
    }

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

    return {
        id: table.id,
        qrCode: table.qrCode,
        tableNumber: table.tableNumber,
        floorName: table.floor.name,
        branchName: table.floor.branch.name,
    };
};

const getTable = async (qrCode) => {

    return prisma.table.findUnique({
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
    }).then(table => {

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

        return {
            id: table.id,
            qrCode: table.qrCode,
            tableNumber: table.tableNumber,
            floorName: table.floor.name,
            branchName: table.floor.branch.name,
        };

    });
};


// ======================================================
// GUEST
// ======================================================

const guest = async ({ deviceId, tableId }) => {

    if (!deviceId) {
        throw new Error("Thiếu deviceId.");
    }

    return await prisma.$transaction(async (tx) => {

        // ------------------------------------------------
        // Kiểm tra bàn
        // ------------------------------------------------

        const table = await getTableInfo(
            tx,
            tableId
        );


        // ------------------------------------------------
        // Tìm guest theo device
        // ------------------------------------------------

        let customer = await tx.customer.findFirst({
            where: {
                deviceId,
                isGuest: true,
            },
        });


        // ------------------------------------------------
        // Guest tồn tại nhưng hết hạn
        // ------------------------------------------------

        if (
            customer &&
            customer.expiredAt &&
            customer.expiredAt < new Date()
        ) {

            customer = await tx.customer.update({
                where: {
                    id: customer.id,
                },
                data: {
                    isActive: false,
                    guestToken: null,
                },
            });

            customer = null;
        }


        // ------------------------------------------------
        // Tạo guest mới
        // ------------------------------------------------

        if (!customer) {

            customer = await tx.customer.create({
                data: {
                    deviceId,
                    guestToken: uuidv4(),
                    isGuest: true,
                    isActive: true,
                    expiredAt: new Date(
                        Date.now() +
                        3 * 24 * 60 * 60 * 1000
                    ),
                },
            });

            await tx.cart.create({
                data: {
                    customerId: customer.id,
                },
            });

        } else {

            // Guest cũ → gia hạn phiên

            customer = await tx.customer.update({
                where: {
                    id: customer.id,
                },
                data: {
                    isActive: true,
                    guestToken: uuidv4(),
                    expiredAt: new Date(
                        Date.now() +
                        3 * 24 * 60 * 60 * 1000
                    ),
                },
            });
        }


        // ------------------------------------------------
        // Tạo token
        // ------------------------------------------------

        const token =
            generateCustomerToken(customer);


        return {
            token,
            customer,
            table,
        };
    });
};


// ======================================================
// REGISTER
// ======================================================

const register = async ({
    name,
    email,
    phone,
    password,
    tableId,
}) => {

    const existed =
        await prisma.customer.findFirst({
            where: {
                OR: [
                    email
                        ? { email }
                        : undefined,

                    phone
                        ? { phone }
                        : undefined,
                ].filter(Boolean),
            },
        });

    if (existed) {
        throw new Error(
            "Email hoặc số điện thoại đã tồn tại."
        );
    }


    const hash =
        await bcrypt.hash(password, 10);


    return await prisma.$transaction(
        async (tx) => {

            // Kiểm tra bàn

            const table =
                await getTableInfo(
                    tx,
                    tableId
                );


            // Tạo customer

            const customer =
                await tx.customer.create({

                    data: {
                        name,
                        email,
                        phone,
                        password: hash,

                        isGuest: false,
                        isActive: true,
                    },
                });


            // Tạo cart

            await tx.cart.create({
                data: {
                    customerId:
                        customer.id,
                },
            });


            // Token

            const token =
                generateCustomerToken(
                    customer
                );


            return {
                token,
                customer,
                table,
            };
        }
    );
};


// ======================================================
// LOGIN
// ======================================================

const login = async ({
    identifier,
    password,
    qrCode,
}) => {

    if (!identifier?.trim()) {
        throw new Error(
            "Vui lòng nhập email hoặc số điện thoại."
        );
    }

    if (!password) {
        throw new Error(
            "Vui lòng nhập mật khẩu."
        );
    }

    const value =
        identifier.trim().toLowerCase();

    // ==========================================
    // TÌM CUSTOMER
    // ==========================================

    const customer =
        await prisma.customer.findFirst({

            where: {
                OR: [
                    {
                        email: value,
                    },
                    {
                        phone: identifier.trim(),
                    },
                ],
            },

        });

    if (!customer) {
        throw new Error(
            "Email hoặc mật khẩu không đúng."
        );
    }

    // ==========================================
    // KIỂM TRA TÀI KHOẢN
    // ==========================================

    if (!customer.isActive) {
        throw new Error(
            "Tài khoản đã bị khóa."
        );
    }

    if (!customer.password) {
        throw new Error(
            "Tài khoản chưa có mật khẩu."
        );
    }

    // ==========================================
    // KIỂM TRA PASSWORD
    // ==========================================

    const ok =
        await bcrypt.compare(
            password,
            customer.password
        );

    if (!ok) {
        throw new Error(
            "Email hoặc mật khẩu không đúng."
        );
    }

    // ==========================================
    // LẤY BÀN
    // ==========================================

    let table = null;

    if (qrCode) {

        table =
            await getTableInfoByQrCode(
                prisma,
                qrCode
            );

    }

    // ==========================================
    // TOKEN
    // ==========================================

    const token =
        generateCustomerToken(
            customer
        );

    return {
        token,
        customer,
        table,
    };
};

// ======================================================
// PROFILE
// ======================================================

const profile = async (customerId) => {

    const customer =
        await prisma.customer.findUnique({

            where: {
                id: customerId,
            },

            include: {

                cart: true,

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

                orderMembers: {
                    include: {
                        order: {
                            include: {
                                orderItems: {
                                    include: {
                                        food: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });


    if (!customer) {
        throw new Error(
            "Khách hàng không tồn tại."
        );
    }


    if (!customer.isActive) {
        throw new Error(
            "Phiên khách đã hết hạn."
        );
    }


    return customer;
};


// ======================================================
// UPDATE PROFILE
// name + avatar
// ======================================================

const updateProfile = async (
    customerId,
    data
) => {

    const customer =
        await prisma.customer.findUnique({

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
            "Phiên khách đã hết hạn."
        );
    }


    const updateData = {};


    if (
        data.name !== undefined
    ) {

        const name =
            data.name.trim();

        if (!name) {
            throw new Error(
                "Vui lòng nhập họ và tên."
            );
        }

        updateData.name = name;

    }


    if (data.avatar) {

        updateData.avatar =
            data.avatar;

    }


    const updated =
        await prisma.customer.update({

            where: {
                id: customerId,
            },

            data: updateData,

        });


    return updated;
};


// ======================================================
// UPDATE PHONE
// ======================================================

const updatePhone = async (
    customerId,
    phone
) => {

    const customer =
        await prisma.customer.findUnique({

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
            "Phiên khách đã hết hạn."
        );
    }


    const value =
        phone?.trim();


    if (!value) {
        throw new Error(
            "Vui lòng nhập số điện thoại."
        );
    }


    if (!/^0\d{9,10}$/.test(value)) {
        throw new Error(
            "Số điện thoại không hợp lệ."
        );
    }


    if (value === customer.phone) {
        throw new Error(
            "Số điện thoại chưa thay đổi."
        );
    }


    const existed =
        await prisma.customer.findFirst({

            where: {
                phone: value,

                NOT: {
                    id: customerId,
                },
            },

        });


    if (existed) {
        throw new Error(
            "Số điện thoại đã tồn tại."
        );
    }


    return await prisma.customer.update({

        where: {
            id: customerId,
        },

        data: {
            phone: value,
        },

    });
};


// ======================================================
// PASSWORD
// ======================================================

const forgotPassword = async () => {};

const resetPassword = async () => {};


module.exports = {
    guest,
    register,
    login,
    profile,
    getTable,
};