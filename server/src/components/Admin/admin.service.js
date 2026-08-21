const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mailService = require("../Mail/mail.server");
const getProfile = async (userId) => {

    const user = await prisma.user.findUnique({

        where: {
            id: Number(userId),
        },

        select: {

            id: true,
            username: true,
            email: true,
            isActive: true,
            createdAt: true,

            role: {
                select: {
                    id: true,
                    name: true,
                },
            },

            restaurant: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },

        },

    });


    if (!user) {

        throw new Error(
            "Tài khoản không tồn tại."
        );

    }


    return user;

};




// ========================================
// UPDATE RESTAURANT
// ========================================

const updateRestaurant = async (
    userId,
    data
) => {

    const restaurant =
        await prisma.restaurant.findUnique({

            where: {
                adminId: Number(userId),
            },

        });


    if (!restaurant) {

        throw new Error(
            "Tài khoản chưa được liên kết với quán."
        );

    }


    // ========================================
    // VALIDATE NAME
    // ========================================

    if (
        data.name !== undefined &&
        !String(data.name).trim()
    ) {

        throw new Error(
            "Tên quán không được để trống."
        );

    }


    const updateData = {};


    if (data.name !== undefined) {

        updateData.name =
            String(data.name).trim();

    }


    if (data.logo !== undefined) {

        updateData.logo =
            data.logo || null;

    }


    return await prisma.restaurant.update({

        where: {
            id: restaurant.id,
        },

        data: updateData,

        select: {

            id: true,
            name: true,
            logo: true,
            adminId: true,
            createdAt: true,
            updatedAt: true,

        },

    });

};

const changePassword = async (
    userId,
    currentPassword,
    newPassword
) => {

    const user = await prisma.user.findUnique({

        where: {
            id: Number(userId),
        },

    });

    if (!user) {
        throw new Error(
            "Tài khoản không tồn tại."
        );
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isMatch) {
        throw new Error(
            "Mật khẩu hiện tại không đúng."
        );
    }

    if (
        !newPassword ||
        newPassword.length < 6
    ) {
        throw new Error(
            "Mật khẩu mới phải có ít nhất 6 ký tự."
        );
    }

    const password =
        await bcrypt.hash(
            newPassword,
            10
        );

    await prisma.user.update({

        where: {
            id: user.id,
        },

        data: {
            password,
            mustChangePassword: false,
        },

    });

    return true;
};

const verifyChangeEmail = async (userId, otp) => {

    if (!otp) {
        throw new Error(
            "Vui lòng nhập mã OTP."
        );
    }

    const record =
        await prisma.emailChangeOtp.findFirst({
            where: {
                userId: Number(userId),
                otp: otp.toString(),
            },
            orderBy: {
                createdAt: "desc",
            },
        });

    if (!record) {
        throw new Error(
            "Mã OTP không đúng."
        );
    }

    if (new Date() > record.expiresAt) {

        await prisma.emailChangeOtp.delete({
            where: {
                id: record.id,
            },
        });

        throw new Error(
            "Mã OTP đã hết hạn."
        );
    }

    // Kiểm tra email mới vẫn chưa bị người khác sử dụng
    const existedUser =
        await prisma.user.findUnique({
            where: {
                email: record.newEmail,
            },
        });

    if (
        existedUser &&
        existedUser.id !== Number(userId)
    ) {
        throw new Error(
            "Email này đã được sử dụng."
        );
    }

    // Đổi sang email mới
    await prisma.user.update({
        where: {
            id: Number(userId),
        },
        data: {
            email: record.newEmail,
        },
    });

    // OTP chỉ dùng 1 lần
    await prisma.emailChangeOtp.delete({
        where: {
            id: record.id,
        },
    });

    return true;
};

const requestChangeEmail = async (
    userId,
    newEmail
) => {

    newEmail = newEmail
        ?.trim()
        .toLowerCase();

    if (!newEmail) {
        throw new Error(
            "Vui lòng nhập email mới."
        );
    }

    // Kiểm tra user
    const user = await prisma.user.findUnique({
        where: {
            id: Number(userId),
        },
    });

    if (!user) {
        throw new Error(
            "Tài khoản không tồn tại."
        );
    }

    // Email mới giống email hiện tại
    if (user.email === newEmail) {
        throw new Error(
            "Email mới phải khác email hiện tại."
        );
    }

    // Kiểm tra email mới đã tồn tại
    const existedUser =
        await prisma.user.findUnique({
            where: {
                email: newEmail,
            },
        });

    if (existedUser) {
        throw new Error(
            "Email này đã được sử dụng."
        );
    }

    // Tạo OTP
    const otp = crypto
        .randomInt(100000, 1000000)
        .toString();

    const expiresAt =
        new Date(
            Date.now() + 5 * 60 * 1000
        );

    // Xóa OTP cũ
    await prisma.emailChangeOtp.deleteMany({
        where: {
            userId: user.id,
        },
    });

    // Lưu OTP + email mới
    await prisma.emailChangeOtp.create({
        data: {
            userId: user.id,
            newEmail: newEmail,
            otp,
            expiresAt,
        },
    });

    // QUAN TRỌNG:
    // Gửi OTP về EMAIL CŨ
    await mailService.sendChangeEmailOtp(
        user.email,
        otp
    );

    return true;
};

module.exports ={
    getProfile,
    updateRestaurant,
    changePassword,
    verifyChangeEmail,
    requestChangeEmail,
}