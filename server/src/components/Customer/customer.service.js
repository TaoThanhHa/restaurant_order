const prisma = require("../../config/prisma");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../../config/mail");


// ======================================================
// UPDATE PROFILE - CUSTOMER
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

    const name = data.name?.trim();

    if (!name) {
        throw new Error(
            "Vui lòng nhập họ và tên."
        );
    }

    return await prisma.customer.update({
        where: {
            id: customerId,
        },
        data: {
            name,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
        },
    });
};

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

    const value = phone?.trim();

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
                id: {
                    not: customerId,
                },
            },
        });

    if (existed) {
        throw new Error(
            "Số điện thoại đã được sử dụng."
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

const changePassword = async (
    customerId,
    currentPassword,
    newPassword
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

    if (!currentPassword) {
        throw new Error(
            "Vui lòng nhập mật khẩu hiện tại."
        );
    }

    if (!newPassword) {
        throw new Error(
            "Vui lòng nhập mật khẩu mới."
        );
    }

    if (newPassword.length < 6) {
        throw new Error(
            "Mật khẩu mới phải có ít nhất 6 ký tự."
        );
    }

    const valid =
        await bcrypt.compare(
            currentPassword,
            customer.password
        );

    if (!valid) {
        throw new Error(
            "Mật khẩu hiện tại không chính xác."
        );
    }

    const hashedPassword =
        await bcrypt.hash(
            newPassword,
            10
        );

    return await prisma.customer.update({
        where: {
            id: customerId,
        },

        data: {
            password: hashedPassword,
        },
    });
};

const sendChangeEmailOtp = async (
    customerId,
    newEmail
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

    const email =
        newEmail?.trim().toLowerCase();

    if (!email) {
        throw new Error(
            "Vui lòng nhập email mới."
        );
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        throw new Error(
            "Email không hợp lệ."
        );
    }

    if (email === customer.email) {
        throw new Error(
            "Email mới phải khác email hiện tại."
        );
    }

    const existed =
        await prisma.customer.findFirst({
            where: {
                email,
                id: {
                    not: customerId,
                },
            },
        });

    if (existed) {
        throw new Error(
            "Email đã được sử dụng."
        );
    }

    // ============================================
    // TẠO OTP
    // ============================================

    const otp =
        crypto
            .randomInt(100000, 1000000)
            .toString();

    const otpExpiresAt =
        new Date(
            Date.now() + 5 * 60 * 1000
        );

    // ============================================
    // LƯU OTP
    // ============================================

    await prisma.customer.update({
        where: {
            id: customerId,
        },

        data: {
            emailOtp: otp,
            emailOtpExpiresAt: otpExpiresAt,
        },
    });

    // ============================================
    // GỬI EMAIL
    // ============================================

    try {

        await transporter.sendMail({

            from:
                `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`,

            to: email,

            subject:
                "Mã OTP xác nhận đổi email",

            html: `
                <div
                    style="
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        line-height: 1.6;
                    "
                >

                    <h2>
                        Xác nhận đổi email
                    </h2>

                    <p>
                        Xin chào
                        <b>${customer.name || "bạn"}</b>,
                    </p>

                    <p>
                        Bạn vừa yêu cầu thay đổi
                        địa chỉ email tài khoản.
                    </p>

                    <p>
                        Mã OTP của bạn là:
                    </p>

                    <div
                        style="
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            color: #4f7d4f;
                            margin: 20px 0;
                        "
                    >
                        ${otp}
                    </div>

                    <p>
                        Mã OTP có hiệu lực trong
                        <b>5 phút</b>.
                    </p>

                    <p>
                        Nếu bạn không thực hiện yêu cầu này,
                        vui lòng bỏ qua email.
                    </p>

                    <hr />

                    <small>
                        Đây là email tự động,
                        vui lòng không trả lời.
                    </small>

                </div>
            `,
        });

    } catch (err) {

        console.error(
            "Gửi OTP đổi email thất bại:",
            err
        );

        throw new Error(
            "Không thể gửi email xác nhận."
        );
    }

    return true;
};

const verifyChangeEmailOtp = async (
    customerId,
    newEmail,
    otp
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

    const email =
        newEmail?.trim().toLowerCase();

    if (!email) {
        throw new Error(
            "Email không hợp lệ."
        );
    }

    if (!otp?.trim()) {
        throw new Error(
            "Vui lòng nhập mã OTP."
        );
    }

    // Kiểm tra OTP
    if (
        customer.emailOtp !==
        otp.trim()
    ) {
        throw new Error(
            "Mã OTP không chính xác."
        );
    }

    // Kiểm tra hết hạn
    if (
        !customer.emailOtpExpiresAt ||
        customer.emailOtpExpiresAt <
        new Date()
    ) {

        throw new Error(
            "Mã OTP đã hết hạn."
        );
    }

    // Kiểm tra email vẫn chưa bị người khác sử dụng
    const existed =
        await prisma.customer.findFirst({
            where: {
                email,
                id: {
                    not: customerId,
                },
            },
        });

    if (existed) {
        throw new Error(
            "Email đã được sử dụng."
        );
    }

    // Đổi email
    const updated =
        await prisma.customer.update({

            where: {
                id: customerId,
            },

            data: {
                email,

                // Xóa OTP sau khi dùng
                emailOtp: null,
                emailOtpExpiresAt: null,
            },
        });

    return updated;
};


module.exports = {
    updateProfile,
    updatePhone,
    changePassword,
    sendChangeEmailOtp,
    verifyChangeEmailOtp,
};