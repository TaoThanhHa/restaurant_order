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
        throw new Error(
            "Bàn đang ngừng sử dụng."
        );
    }


    // GIỮ NGUYÊN FORMAT CŨ
    // FE đang dùng các thông tin này
    return {

        id: table.id,

        qrCode: table.qrCode,

        tableNumber:
            table.tableNumber,

        floorName:
            table.floor.name,

        branchName:
            table.floor.branch.name,

    };
};


// ======================================================
// GET TABLE
// ======================================================

const getTable = async (qrCode) => {

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
            "Bàn không tồn tại."
        );
    }


    if (table.status === "DISABLED") {
        throw new Error(
            "Bàn đang ngừng sử dụng."
        );
    }


    // GIỮ NGUYÊN FORMAT CŨ
    return {

        id: table.id,

        qrCode: table.qrCode,

        tableNumber:
            table.tableNumber,

        floorName:
            table.floor.name,

        branchName:
            table.floor.branch.name,

    };
};


// ======================================================
// HELPER: TÌM GUEST ĐANG HOẠT ĐỘNG
// ======================================================

const findActiveGuest = async (
    tx,
    deviceId
) => {

    if (!deviceId) {
        return null;
    }


    let guest =
        await tx.customer.findFirst({

            where: {

                deviceId,

                isGuest: true,

                isActive: true,

            },

        });


    if (!guest) {
        return null;
    }


    // ==================================================
    // GUEST HẾT HẠN
    // ==================================================

    if (
        guest.expiredAt &&
        guest.expiredAt < new Date()
    ) {

        await tx.customer.update({

            where: {
                id: guest.id,
            },

            data: {

                isActive: false,

                guestToken: null,

            },

        });


        return null;
    }


    return guest;
};


// ======================================================
// HELPER: CHUYỂN DỮ LIỆU GUEST
// ======================================================

const transferGuestData = async (
    tx,
    guestCustomer,
    customer
) => {

    // ==================================================
    // 1. CHUYỂN ORDER MEMBER
    // ==================================================

    await tx.orderMember.updateMany({

        where: {
            customerId:
                guestCustomer.id,
        },

        data: {
            customerId:
                customer.id,
        },

    });


    // ==================================================
    // 2. CHUYỂN ORDER DO GUEST TẠO
    // ==================================================

    await tx.order.updateMany({

        where: {
            createdByCustomerId:
                guestCustomer.id,
        },

        data: {
            createdByCustomerId:
                customer.id,
        },

    });


    // ==================================================
    // 3. CHUYỂN SERVICE REQUEST
    // ==================================================

    await tx.serviceRequest.updateMany({

        where: {
            customerId:
                guestCustomer.id,
        },

        data: {
            customerId:
                customer.id,
        },

    });


    // ==================================================
    // 4. VÔ HIỆU GUEST
    // ==================================================

    await tx.customer.update({

        where: {
            id: guestCustomer.id,
        },

        data: {

            isActive: false,

            guestToken: null,

            currentOrderId: null,

        },

    });
};


// ======================================================
// GUEST LOGIN
// ======================================================
// ======================================================
// GUEST LOGIN
// ======================================================

const guest = async ({
    deviceId,
    tableId,
}) => {

    if (!deviceId) {
        throw new Error(
            "Thiếu deviceId."
        );
    }


    return await prisma.$transaction(
        async (tx) => {

            // ==================================================
            // 1. KIỂM TRA BÀN
            // ==================================================

            const table =
                await getTableInfo(
                    tx,
                    tableId
                );


            // ==================================================
            // 2. TÌM GUEST THEO DEVICE
            // ==================================================

            let customer =
                await tx.customer.findFirst({

                    where: {

                        deviceId,

                        isGuest: true,

                    },

                });


            // ==================================================
            // 3. NẾU ĐÃ CÓ GUEST
            //    → DÙNG LẠI GUEST CŨ
            // ==================================================

            if (customer) {

                customer =
                    await tx.customer.update({

                        where: {
                            id: customer.id,
                        },

                        data: {

                            // Kích hoạt lại guest
                            isActive: true,

                            // Tạo token mới
                            guestToken:
                                uuidv4(),

                            // Gia hạn thêm 3 ngày
                            expiredAt:
                                new Date(
                                    Date.now() +
                                    3 *
                                    24 *
                                    60 *
                                    60 *
                                    1000
                                ),

                            // Cập nhật bàn hiện tại
                            tableId:
                                table.id,

                        },

                    });

            }

            // ==================================================
            // 4. CHƯA CÓ GUEST
            //    → TẠO GUEST MỚI
            // ==================================================

            else {

                customer =
                    await tx.customer.create({

                        data: {

                            deviceId,

                            guestToken:
                                uuidv4(),

                            isGuest:
                                true,

                            isActive:
                                true,

                            expiredAt:
                                new Date(
                                    Date.now() +
                                    3 *
                                    24 *
                                    60 *
                                    60 *
                                    1000
                                ),

                            tableId:
                                table.id,

                        },

                    });


                // ==================================================
                // CART
                // ==================================================

                await tx.cart.create({

                    data: {

                        customerId:
                            customer.id,

                    },

                });

            }


            // ==================================================
            // 5. TOKEN
            // ==================================================

            const token =
                generateCustomerToken(
                    customer
                );


            // ==================================================
            // 6. RETURN
            // ==================================================

            return {
                token,
                customer,
                table,
            };

        }
    );
};


const register = async ({
    name,
    email,
    phone,
    password,
    tableId,
    deviceId,
}) => {

    if (!name?.trim()) {
        throw new Error(
            "Vui lòng nhập họ và tên."
        );
    }


    if (!email && !phone) {
        throw new Error(
            "Vui lòng nhập email hoặc số điện thoại."
        );
    }


    if (!password) {
        throw new Error(
            "Vui lòng nhập mật khẩu."
        );
    }


    if (password.length < 6) {
        throw new Error(
            "Mật khẩu phải có ít nhất 6 ký tự."
        );
    }


    return await prisma.$transaction(
        async (tx) => {

            // ==================================================
            // 1. KIỂM TRA EMAIL / PHONE
            // ==================================================

            const existed =
                await tx.customer.findFirst({

                    where: {

                        OR: [

                            email
                                ? {
                                    email:
                                        email
                                            .trim()
                                            .toLowerCase(),
                                }
                                : undefined,

                            phone
                                ? {
                                    phone:
                                        phone.trim(),
                                }
                                : undefined,

                        ].filter(Boolean),

                    },

                });


            if (existed) {
                throw new Error(
                    "Email hoặc số điện thoại đã tồn tại."
                );
            }


            // ==================================================
            // 2. LẤY BÀN
            // ==================================================

            const table =
                await getTableInfo(
                    tx,
                    tableId
                );


            // ==================================================
            // 3. TÌM GUEST
            // ==================================================

            const guestCustomer =
                await findActiveGuest(
                    tx,
                    deviceId
                );


            // ==================================================
            // 4. HASH PASSWORD
            // ==================================================

            const hash =
                await bcrypt.hash(
                    password,
                    10
                );


            // ==================================================
            // 5. TẠO CUSTOMER
            // ==================================================

            const customer =
                await tx.customer.create({

                    data: {

                        name:
                            name.trim(),

                        email:
                            email
                                ?.trim()
                                .toLowerCase() ||
                            null,

                        phone:
                            phone?.trim() ||
                            null,

                        password:
                            hash,

                        isGuest:
                            false,

                        isActive:
                            true,

                        // --------------------------------------
                        // GIỮ SESSION CỦA GUEST
                        // --------------------------------------

                        sessionId:
                            guestCustomer?.sessionId ||
                            null,

                        // --------------------------------------
                        // GIỮ BÀN CỦA GUEST
                        // --------------------------------------

                        tableId:
                            guestCustomer?.tableId ||
                            table.id,

                        // --------------------------------------
                        // GIỮ ORDER HIỆN TẠI
                        // --------------------------------------

                        currentOrderId:
                            guestCustomer?.currentOrderId ||
                            null,

                    },

                });


            // ==================================================
            // 6. TẠO CART
            // ==================================================

            await tx.cart.create({

                data: {

                    customerId:
                        customer.id,

                },

            });


            // ==================================================
            // 7. CHUYỂN ORDER GUEST → CUSTOMER
            // ==================================================

            if (guestCustomer) {

                await transferGuestData(
                    tx,
                    guestCustomer,
                    customer
                );

            }


            // ==================================================
            // 8. LẤY CUSTOMER MỚI NHẤT
            // ==================================================

            const updatedCustomer =
                await tx.customer.findUnique({

                    where: {
                        id: customer.id,
                    },

                });


            // ==================================================
            // 9. TOKEN
            // ==================================================

            const token =
                generateCustomerToken(
                    updatedCustomer
                );


            // ==================================================
            // 10. RETURN
            // ==================================================

            return {

                token,

                customer:
                    updatedCustomer,

                // GIỮ NGUYÊN TABLE
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
    deviceId,
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
        identifier.trim();


    return await prisma.$transaction(
        async (tx) => {

            // ==================================================
            // 1. TÌM CUSTOMER
            // ==================================================

            const customer =
                await tx.customer.findFirst({

                    where: {

                        OR: [

                            {
                                email:
                                    value
                                        .toLowerCase(),
                            },

                            {
                                phone:
                                    value,
                            },

                        ],

                    },

                });


            if (!customer) {
                throw new Error(
                    "Email hoặc mật khẩu không đúng."
                );
            }


            // ==================================================
            // 2. KIỂM TRA TÀI KHOẢN
            // ==================================================

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


            // ==================================================
            // 3. KIỂM TRA PASSWORD
            // ==================================================

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


            // ==================================================
            // 4. TÌM GUEST TRÊN THIẾT BỊ HIỆN TẠI
            // ==================================================

            const guestCustomer =
                await findActiveGuest(
                    tx,
                    deviceId
                );


            // ==================================================
            // 5. CHUYỂN GUEST → CUSTOMER
            // ==================================================

            if (

                guestCustomer &&

                guestCustomer.id !== customer.id

            ) {

                // ----------------------------------------------
                // Giữ session / bàn / order của Guest
                // ----------------------------------------------

                await tx.customer.update({

                    where: {
                        id: customer.id,
                    },

                    data: {

                        sessionId:
                            customer.sessionId ||
                            guestCustomer.sessionId ||
                            null,

                        tableId:
                            customer.tableId ||
                            guestCustomer.tableId ||
                            null,

                        currentOrderId:
                            customer.currentOrderId ||
                            guestCustomer.currentOrderId ||
                            null,

                    },

                });


                // ----------------------------------------------
                // Chuyển toàn bộ liên kết Guest
                // ----------------------------------------------

                await transferGuestData(
                    tx,
                    guestCustomer,
                    customer
                );

            }


            // ==================================================
            // 6. LẤY BÀN
            // ==================================================

            let table = null;


            if (qrCode) {

                // DÙNG LẠI getTableInfo()
                // KHÔNG thay đổi format table

                table =
                    await getTableInfo(
                        tx,
                        qrCode
                    );

            }


            // ==================================================
            // 7. LẤY CUSTOMER MỚI NHẤT
            // ==================================================

            const updatedCustomer =
                await tx.customer.findUnique({

                    where: {
                        id: customer.id,
                    },

                });


            // ==================================================
            // 8. TOKEN
            // ==================================================

            const token =
                generateCustomerToken(
                    updatedCustomer
                );


            // ==================================================
            // 9. RETURN
            // ==================================================

            return {

                token,

                customer:
                    updatedCustomer,

                // GIỮ NGUYÊN TABLE
                table,

            };

        }
    );
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



module.exports = {
    guest,
    register,
    login,
    profile,
    getTable,
};