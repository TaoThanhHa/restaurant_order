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
                include: { branch: true },
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
    const table = await prisma.table.findUnique({
        where: { qrCode },
        include: {
            floor: {
                include: { branch: true },
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

const findActiveGuest = async (tx, deviceId) => {
    if (!deviceId) {
        return null;
    }

    const guest = await tx.customer.findFirst({
        where: {
            deviceId,
            isGuest: true,
            isActive: true,
        },
    });

    if (!guest) {
        return null;
    }

    if (guest.expiredAt && guest.expiredAt < new Date()) {
        await tx.customer.update({
            where: { id: guest.id },
            data: {
                isActive: false,
                guestToken: null,
            },
        });

        return null;
    }

    return guest;
};

const transferGuestData = async (tx, guestCustomer, customer) => {
    await tx.orderMember.updateMany({
        where: { customerId: guestCustomer.id },
        data: { customerId: customer.id },
    });

    await tx.order.updateMany({
        where: { createdByCustomerId: guestCustomer.id },
        data: { createdByCustomerId: customer.id },
    });

    await tx.serviceRequest.updateMany({
        where: { customerId: guestCustomer.id },
        data: { customerId: customer.id },
    });

    await tx.customer.update({
        where: { id: guestCustomer.id },
        data: {
            isActive: false,
            guestToken: null,
            currentOrderId: null,
        },
    });
};

const guest = async ({ deviceId, tableId }) => {
    if (!deviceId) {
        throw new Error("Thiếu deviceId.");
    }

    return prisma.$transaction(async (tx) => {
        const table = await getTableInfo(tx, tableId);

        let customer = await tx.customer.findFirst({
            where: {
                deviceId,
                isGuest: true,
            },
        });

        if (customer) {
            customer = await tx.customer.update({
                where: { id: customer.id },
                data: {
                    isActive: true,
                    guestToken: uuidv4(),
                    expiredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                    tableId: table.id,
                },
            });
        } else {
            customer = await tx.customer.create({
                data: {
                    deviceId,
                    guestToken: uuidv4(),
                    isGuest: true,
                    isActive: true,
                    expiredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                    tableId: table.id,
                },
            });

            await tx.cart.create({
                data: { customerId: customer.id },
            });
        }

        const token = generateCustomerToken(customer);

        return {
            token,
            customer,
            table,
        };
    });
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

    return prisma.$transaction(async (tx) => {
        const existed = await tx.customer.findFirst({
            where: {
                OR: [
                    email
                        ? { email: email.trim().toLowerCase() }
                        : undefined,
                    phone ? { phone: phone.trim() } : undefined,
                ].filter(Boolean),
            },
        });

        if (existed) {
            throw new Error("Email hoặc số điện thoại đã tồn tại.");
        }

        const table = await getTableInfo(tx, tableId);
        const guestCustomer = await findActiveGuest(tx, deviceId);
        const hash = await bcrypt.hash(password, 10);

        const customer = await tx.customer.create({
            data: {
                name: name.trim(),
                email: email?.trim().toLowerCase() || null,
                phone: phone?.trim() || null,
                password: hash,
                isGuest: false,
                isActive: true,
                sessionId: guestCustomer?.sessionId || null,
                tableId: guestCustomer?.tableId || table.id,
                currentOrderId: guestCustomer?.currentOrderId || null,
            },
        });

        await tx.cart.create({
            data: { customerId: customer.id },
        });

        if (guestCustomer) {
            await transferGuestData(tx, guestCustomer, customer);
        }

        const updatedCustomer = await tx.customer.findUnique({
            where: { id: customer.id },
        });

        const token = generateCustomerToken(updatedCustomer);

        return {
            token,
            customer: updatedCustomer,
            table,
        };
    });
};

const login = async ({
    identifier,
    password,
    qrCode,
    deviceId,
}) => {
    if (!identifier?.trim()) {
        throw new Error("Vui lòng nhập email hoặc số điện thoại.");
    }

    if (!password) {
        throw new Error("Vui lòng nhập mật khẩu.");
    }

    const value = identifier.trim();

    return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findFirst({
            where: {
                OR: [
                    { email: value.toLowerCase() },
                    { phone: value },
                ],
            },
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

        const ok = await bcrypt.compare(password, customer.password);

        if (!ok) {
            throw new Error("Email hoặc mật khẩu không đúng.");
        }

        const guestCustomer = await findActiveGuest(tx, deviceId);

        if (guestCustomer && guestCustomer.id !== customer.id) {
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
                        null,
                },
            });

            await transferGuestData(tx, guestCustomer, customer);
        }

        let table = null;

        if (qrCode) {
            table = await getTableInfo(tx, qrCode);
        }

        const updatedCustomer = await tx.customer.findUnique({
            where: { id: customer.id },
        });

        const token = generateCustomerToken(updatedCustomer);

        return {
            token,
            customer: updatedCustomer,
            table,
        };
    });
};

const profile = async (customerId) => {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            cart: true,
            session: {
                include: {
                    table: {
                        include: {
                            floor: {
                                include: { branch: true },
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
                                include: { food: true },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!customer) {
        throw new Error("Khách hàng không tồn tại.");
    }

    if (!customer.isActive) {
        throw new Error("Phiên khách đã hết hạn.");
    }

    return customer;
};

const forgotPassword = async (email) => {
    if (!email?.trim()) {
        throw new Error("Vui lòng nhập email.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const customer = await prisma.customer.findUnique({
        where: { email: normalizedEmail },
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.customer.update({
        where: { id: customer.id },
        data: {
            emailOtp: otp,
            emailOtpExpiresAt: expiresAt,
        },
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
            `,
        });
    } catch (err) {
        console.error("SEND CUSTOMER OTP ERROR:", err);
        throw new Error("Không thể gửi email.");
    }

    return {
        message: "Mã OTP đã được gửi đến email của bạn.",
    };
};

const verifyOtp = async ({ email, otp }) => {
    if (!email?.trim()) {
        throw new Error("Vui lòng nhập email.");
    }

    if (!otp?.trim()) {
        throw new Error("Vui lòng nhập mã OTP.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const customer = await prisma.customer.findUnique({
        where: { email: normalizedEmail },
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
        throw new Error("OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
    }

    if (customer.emailOtp !== otp.trim()) {
        throw new Error("OTP không đúng.");
    }

    return {
        message: "Xác thực OTP thành công.",
    };
};

const resetPassword = async ({ email, otp, password }) => {
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

    await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
    });

    const normalizedEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);

    await prisma.customer.update({
        where: { email: normalizedEmail },
        data: {
            password: hash,
            emailOtp: null,
            emailOtpExpiresAt: null,
        },
    });

    return {
        message: "Đổi mật khẩu thành công.",
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
    resetPassword,
};