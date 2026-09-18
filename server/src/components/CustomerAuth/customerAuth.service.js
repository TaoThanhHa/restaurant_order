const bcrypt = require("bcrypt");
const prisma = require("../../config/prisma");
const mail = require("../../config/mail");
const { generateCustomerToken } = require("../../utils/jwtCustomer");
const { v4: uuidv4 } = require("uuid");

const getTableInfo = async (tx, tableId) => {
    if (!tableId) {
        throw new Error("Thiếu mã QR của bàn.");
    }

    const table = await tx.table.findUnique({
        where: { qrCode: tableId },
        include: {
            floor: {
                include: {
                    branch: {
                        include: {
                            restaurant: true
                        }
                    }
                }
            }
        }
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
        branchId: table.floor.branch.id,
        branchName: table.floor.branch.name,
        restaurantId: table.floor.branch.restaurantId,
        restaurantName: table.floor.branch.restaurant?.name || null
    };
};

const getTable = async (qrCode) => {
    const table = await prisma.table.findUnique({
        where: { qrCode },
        include: {
            floor: {
                include: {
                    branch: {
                        include: {
                            restaurant: true
                        }
                    }
                }
            }
        }
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
        branchId: table.floor.branch.id,
        branchName: table.floor.branch.name,
        restaurantId: table.floor.branch.restaurantId,
        restaurantName: table.floor.branch.restaurant?.name || null
    };
};

const findActiveGuest = async (tx, deviceId, restaurantId) => {
    if (!deviceId || !restaurantId) {
        return null;
    }

    const guest = await tx.customer.findFirst({
        where: {
            deviceId,
            restaurantId,
            isGuest: true,
            isActive: true
        }
    });

    if (!guest) {
        return null;
    }

    if (guest.expiredAt && guest.expiredAt < new Date()) {
        await tx.customer.update({
            where: { id: guest.id },
            data: {
                isActive: false,
                guestToken: null
            }
        });

        return null;
    }

    return guest;
};

const transferGuestData = async (tx, guestCustomer, customer) => {
    await tx.orderMember.updateMany({
        where: { customerId: guestCustomer.id },
        data: { customerId: customer.id }
    });

    await tx.order.updateMany({
        where: { createdByCustomerId: guestCustomer.id },
        data: { createdByCustomerId: customer.id }
    });

    await tx.serviceRequest.updateMany({
        where: { customerId: guestCustomer.id },
        data: { customerId: customer.id }
    });

    const guestCart = await tx.cart.findUnique({
        where: { customerId: guestCustomer.id },
        include: { items: true }
    });

    const customerCart = await tx.cart.findUnique({
        where: { customerId: customer.id },
        include: { items: true }
    });

    if (guestCart && customerCart) {
        for (const guestItem of guestCart.items) {
            const customerItem = customerCart.items.find(
                item => item.foodId === guestItem.foodId
            );

            if (customerItem) {
                await tx.cartItem.update({
                    where: { id: customerItem.id },
                    data: {
                        quantity:
                            customerItem.quantity +
                            guestItem.quantity,
                        note: guestItem.note || customerItem.note
                    }
                });

                await tx.cartItem.delete({
                    where: { id: guestItem.id }
                });
            } else {
                await tx.cartItem.update({
                    where: { id: guestItem.id },
                    data: {
                        cartId: customerCart.id
                    }
                });
            }
        }
    }

    await tx.customer.update({
        where: { id: guestCustomer.id },
        data: {
            isActive: false,
            guestToken: null,
            currentOrderId: null
        }
    });
};

const guest = async ({ deviceId, tableId }) => {
    if (!deviceId) {
        throw new Error("Thiếu deviceId.");
    }

    return prisma.$transaction(async tx => {
        const table = await getTableInfo(tx, tableId);

        let customer = await tx.customer.findFirst({
            where: {
                deviceId,
                restaurantId: table.restaurantId,
                isGuest: true
            }
        });

        if (customer) {
            customer = await tx.customer.update({
                where: { id: customer.id },
                data: {
                    isActive: true,
                    guestToken: uuidv4(),
                    expiredAt: new Date(
                        Date.now() + 3 * 24 * 60 * 60 * 1000
                    ),
                    tableId: table.id
                }
            });
        } else {
            customer = await tx.customer.create({
                data: {
                    deviceId,
                    restaurantId: table.restaurantId,
                    guestToken: uuidv4(),
                    isGuest: true,
                    isActive: true,
                    expiredAt: new Date(
                        Date.now() + 3 * 24 * 60 * 60 * 1000
                    ),
                    tableId: table.id
                }
            });

            await tx.cart.create({
                data: { customerId: customer.id }
            });
        }

        const token = generateCustomerToken(customer);

        return {
            token,
            customer,
            table
        };
    });
};

const register = async ({
    name,
    email,
    phone,
    password,
    tableId,
    deviceId
}) => {
    if (!name?.trim()) {
        throw new Error("Vui lòng nhập họ và tên.");
    }

    if (!email && !phone) {
        throw new Error("Vui lòng nhập email hoặc số điện thoại.");
    }

    if (!password) {
        throw new Error("Vui lòng nhập mật khẩu.");
    }

    if (password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    return prisma.$transaction(async tx => {
        const table = await getTableInfo(tx, tableId);
        const restaurantId = table.restaurantId;

        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedPhone = phone?.trim();

        const existed = await tx.customer.findFirst({
            where: {
                restaurantId,
                OR: [
                    normalizedEmail
                        ? { email: normalizedEmail }
                        : undefined,
                    normalizedPhone
                        ? { phone: normalizedPhone }
                        : undefined
                ].filter(Boolean)
            }
        });

        if (existed) {
            throw new Error("Email hoặc số điện thoại đã tồn tại.");
        }

        const guestCustomer = await findActiveGuest(
            tx,
            deviceId,
            restaurantId
        );

        const hash = await bcrypt.hash(password, 10);

        const customer = await tx.customer.create({
            data: {
                name: name.trim(),
                email: normalizedEmail || null,
                phone: normalizedPhone || null,
                password: hash,
                restaurantId,
                isGuest: false,
                isActive: true,
                sessionId: guestCustomer?.sessionId || null,
                tableId: guestCustomer?.tableId || table.id,
                currentOrderId: guestCustomer?.currentOrderId || null
            }
        });

        await tx.cart.create({
            data: { customerId: customer.id }
        });

        if (guestCustomer) {
            await transferGuestData(tx, guestCustomer, customer);
        }

        const updatedCustomer = await tx.customer.findUnique({
            where: { id: customer.id }
        });

        const token = generateCustomerToken(updatedCustomer);

        return {
            token,
            customer: updatedCustomer,
            table
        };
    });
};

const login = async ({
    identifier,
    password,
    qrCode,
    deviceId
}) => {
    if (!identifier?.trim()) {
        throw new Error("Vui lòng nhập email hoặc số điện thoại.");
    }

    if (!password) {
        throw new Error("Vui lòng nhập mật khẩu.");
    }

    const value = identifier.trim();

    return prisma.$transaction(async tx => {
        let restaurantId = null;
        let table = null;

        if (qrCode) {
            table = await getTableInfo(tx, qrCode);
            restaurantId = table.restaurantId;
        }

        const customer = await tx.customer.findFirst({
            where: {
                ...(restaurantId ? { restaurantId } : {}),
                OR: [
                    { email: value.toLowerCase() },
                    { phone: value }
                ]
            }
        });

        if (!customer) {
            throw new Error("Email hoặc mật khẩu không đúng.");
        }

        if (!customer.isActive) {
            throw new Error("Tài khoản đã bị khóa.");
        }

        if (!customer.password) {
            throw new Error("Tài khoản chưa có mật khẩu.");
        }

        const ok = await bcrypt.compare(
            password,
            customer.password
        );

        if (!ok) {
            throw new Error("Email hoặc mật khẩu không đúng.");
        }

        const guestCustomer = await findActiveGuest(
            tx,
            deviceId,
            customer.restaurantId
        );

        if (
            guestCustomer &&
            guestCustomer.id !== customer.id
        ) {
            await tx.customer.update({
                where: { id: customer.id },
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
                        null
                }
            });

            await transferGuestData(
                tx,
                guestCustomer,
                customer
            );
        }

        const updatedCustomer = await tx.customer.findUnique({
            where: { id: customer.id }
        });

        const token = generateCustomerToken(updatedCustomer);

        return {
            token,
            customer: updatedCustomer,
            table
        };
    });
};

const profile = async customerId => {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            cart: true,
            session: {
                include: {
                    table: {
                        include: {
                            floor: {
                                include: {
                                    branch: true
                                }
                            }
                        }
                    }
                }
            },
            orderMembers: {
                include: {
                    order: {
                        include: {
                            orderItems: {
                                include: { food: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!customer) {
        throw new Error("Khách hàng không tồn tại.");
    }

    if (!customer.isActive) {
        throw new Error("Phiên khách đã hết hạn.");
    }

    return customer;
};

const forgotPassword = async (email, qrCode) => {
    if (!email?.trim()) {
        throw new Error("Vui lòng nhập email.");
    }

    if (!qrCode) {
        throw new Error("Thiếu mã QR của bàn.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const table = await getTableInfo(prisma, qrCode);

    const customer = await prisma.customer.findFirst({
        where: {
            restaurantId: table.restaurantId,
            email: normalizedEmail
        }
    });

    if (!customer) {
        throw new Error("Email không tồn tại trong hệ thống.");
    }

    if (customer.isGuest) {
        throw new Error(
            "Tài khoản khách chưa đăng ký không thể sử dụng chức năng này."
        );
    }

    if (!customer.isActive) {
        throw new Error("Tài khoản đã bị khóa.");
    }

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
        Date.now() + 5 * 60 * 1000
    );

    await prisma.customer.update({
        where: { id: customer.id },
        data: {
            emailOtp: otp,
            emailOtpExpiresAt: expiresAt
        }
    });

    try {
        await mail.sendMail({
            from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`,
            to: normalizedEmail,
            subject: "Mã OTP đặt lại mật khẩu",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Xin chào <b>${customer.name || "Khách hàng"}</b>,</p>
                    <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
                    <h1 style="letter-spacing: 8px; font-size: 32px;">${otp}</h1>
                    <p>OTP có hiệu lực trong <b>5 phút</b>.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <hr />
                    <small>Đây là email tự động, vui lòng không trả lời.</small>
                </div>
            `
        });
    } catch (err) {
        console.error("SEND CUSTOMER OTP ERROR:", err);
        throw new Error("Không thể gửi email.");
    }

    return {
        message: "Mã OTP đã được gửi đến email của bạn."
    };
};

const verifyOtp = async ({ email, otp, qrCode }) => {
    if (!email?.trim()) {
        throw new Error("Vui lòng nhập email.");
    }

    if (!otp?.trim()) {
        throw new Error("Vui lòng nhập mã OTP.");
    }

    if (!qrCode) {
        throw new Error("Thiếu mã QR của bàn.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const table = await getTableInfo(prisma, qrCode);

    const customer = await prisma.customer.findFirst({
        where: {
            restaurantId: table.restaurantId,
            email: normalizedEmail
        }
    });

    if (!customer) {
        throw new Error("Email không tồn tại trong hệ thống.");
    }

    if (!customer.emailOtp) {
        throw new Error("Bạn chưa yêu cầu mã OTP.");
    }

    if (
        !customer.emailOtpExpiresAt ||
        customer.emailOtpExpiresAt < new Date()
    ) {
        throw new Error(
            "OTP đã hết hạn. Vui lòng yêu cầu mã mới."
        );
    }

    if (customer.emailOtp !== otp.trim()) {
        throw new Error("OTP không đúng.");
    }

    return {
        message: "Xác thực OTP thành công."
    };
};

const resetPassword = async ({
    email,
    otp,
    password,
    qrCode
}) => {
    if (!email?.trim()) {
        throw new Error("Vui lòng nhập email.");
    }

    if (!otp?.trim()) {
        throw new Error("Vui lòng nhập mã OTP.");
    }

    if (!password) {
        throw new Error("Vui lòng nhập mật khẩu mới.");
    }

    if (password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    if (!qrCode) {
        throw new Error("Thiếu mã QR của bàn.");
    }

    await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        qrCode
    });

    const normalizedEmail = email.trim().toLowerCase();

    const table = await getTableInfo(prisma, qrCode);

    const hash = await bcrypt.hash(password, 10);

    await prisma.customer.updateMany({
        where: {
            restaurantId: table.restaurantId,
            email: normalizedEmail
        },
        data: {
            password: hash,
            emailOtp: null,
            emailOtpExpiresAt: null
        }
    });

    return {
        message: "Đổi mật khẩu thành công."
    };
};

module.exports = {
    guest,
    register,
    login,
    profile,
    getTable,
    forgotPassword,
    verifyOtp,
    resetPassword
};