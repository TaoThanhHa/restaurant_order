const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");
const mailService = require("../Mail/mail.server");


// ========================================
// GENERATE PASSWORD
// ========================================

const generatePassword = () => {

    return crypto
        .randomBytes(8)
        .toString("base64")
        .replace(/[+/=]/g, "")
        .substring(0, 10);

};


// ========================================
// GET ALL STAFF BY BRANCH
// ========================================

const getAll = async (branchId) => {

    branchId = Number(branchId);

    const branch = await prisma.branch.findUnique({

        where: {
            id: branchId,
        },

        select: {
            id: true,
            name: true,
            isActive: true,
        },

    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }


    const staff = await prisma.user.findMany({

        where: {

            branchId,

            role: {

                name: {

                    in: [
                        "ORDER",
                        "KITCHEN",
                    ],

                },

            },

        },

        select: {

            id: true,

            username: true,

            email: true,

            isActive: true,

            mustChangePassword: true,

            createdAt: true,

            updatedAt: true,

            role: {

                select: {
                    id: true,
                    name: true,
                },

            },

        },

        orderBy: {
            id: "asc",
        },

    });

    return {

        branch,

        staff,

    };

};


// ========================================
// GET STAFF BY ID
// ========================================

const getById = async (
    branchId,
    userId
) => {

    branchId = Number(branchId);
    userId = Number(userId);

    const user = await prisma.user.findFirst({

        where: {

            id: userId,

            branchId,

            role: {

                name: {

                    in: [
                        "ORDER",
                        "KITCHEN",
                    ],

                },

            },

        },

        select: {

            id: true,

            username: true,

            email: true,

            isActive: true,

            mustChangePassword: true,

            createdAt: true,

            updatedAt: true,

            role: {

                select: {

                    id: true,
                    name: true,

                },

            },

            branch: {

                select: {

                    id: true,
                    name: true,

                },

            },

        },

    });

    if (!user) {
        throw new Error(
            "Nhân viên không tồn tại trong chi nhánh này."
        );
    }

    return user;

};


// ========================================
// CREATE STAFF
// ========================================

const create = async (
    branchId,
    data
) => {

    branchId = Number(branchId);

    const username =
        data.username?.trim();

    const email =
        data.email?.trim().toLowerCase();

    const roleName =
        data.role?.trim().toUpperCase();


    // VALIDATE BRANCH

    const branch = await prisma.branch.findUnique({
        where: {
            id: branchId,
        },
        select: {
            id: true,
            name: true,
            isActive: true,
        },
    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

    if (!branch.isActive) {
        throw new Error(
            "Chi nhánh đang bị khóa, không thể thêm nhân viên."
        );
    }


    // VALIDATE USERNAME

    if (!username) {

        throw new Error(
            "Tên tài khoản không được để trống."
        );

    }


    // VALIDATE EMAIL

    if (!email) {

        throw new Error(
            "Email không được để trống."
        );

    }

    if (!validator.isEmail(email)) {

        throw new Error(
            "Email không hợp lệ."
        );

    }


    // VALIDATE ROLE

    const allowedRoles = [
        "ORDER",
        "KITCHEN",
    ];

    if (!allowedRoles.includes(roleName)) {

        throw new Error(
            "Chức vụ không hợp lệ."
        );

    }


    // CHECK USERNAME

    const existedUsername =
        await prisma.user.findUnique({

            where: {
                username,
            },

        });

    if (existedUsername) {

        throw new Error(
            "Tên tài khoản đã tồn tại."
        );

    }


    // CHECK EMAIL

    const existedEmail =
        await prisma.user.findUnique({

            where: {
                email,
            },

        });

    if (existedEmail) {

        throw new Error(
            "Email đã được sử dụng."
        );

    }


    // GET ROLE

    const role =
        await prisma.role.findUnique({

            where: {
                name: roleName,
            },

        });

    if (!role) {

        throw new Error(
            `Không tìm thấy role ${roleName}.`
        );

    }


    // GENERATE PASSWORD

    const tempPassword =
        generatePassword();

    const hashedPassword =
        await bcrypt.hash(
            tempPassword,
            10
        );


    // CREATE USER

    const staff =
        await prisma.user.create({

            data: {

                username,

                email,

                password:
                    hashedPassword,

                roleId:
                    role.id,

                branchId,

                isActive: true,

                mustChangePassword: true,

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

                branch: {

                    select: {

                        id: true,
                        name: true,

                    },

                },

            },

        });


    // SEND EMAIL

    try {

        await mailService.sendStaffAccount(
            branch.name,
            username,
            email,
            roleName,
            tempPassword
        );

    } catch (error) {

        // Nếu gửi mail lỗi
        // xóa tài khoản vừa tạo

        await prisma.user.delete({

            where: {
                id: staff.id,
            },

        });

        throw error;

    }

    return staff;

};


// ========================================
// UPDATE STAFF
// ========================================

const update = async (
    branchId,
    userId,
    data
) => {

    branchId = Number(branchId);
    userId = Number(userId);


    // CHECK STAFF

    const staff =
        await prisma.user.findFirst({

            where: {

                id: userId,

                branchId,

                role: {

                    name: {

                        in: [
                            "ORDER",
                            "KITCHEN",
                        ],

                    },

                },

            },

            include: {

                role: true,

            },

        });

    if (!staff) {

        throw new Error(
            "Nhân viên không tồn tại trong chi nhánh này."
        );

    }


    const username =
        data.username?.trim()
        ?? staff.username;

    const email =
        data.email
            ? data.email.trim().toLowerCase()
            : staff.email;

    const roleName =
        data.role
            ? data.role.trim().toUpperCase()
            : staff.role.name;


    // VALIDATE

    if (!username) {

        throw new Error(
            "Tên tài khoản không được để trống."
        );

    }

    if (!validator.isEmail(email)) {

        throw new Error(
            "Email không hợp lệ."
        );

    }


    const allowedRoles = [
        "ORDER",
        "KITCHEN",
    ];

    if (!allowedRoles.includes(roleName)) {

        throw new Error(
            "Không thể gán chức vụ này."
        );

    }


    // CHECK USERNAME

    const existedUsername =
        await prisma.user.findFirst({

            where: {

                username,

                NOT: {
                    id: userId,
                },

            },

        });

    if (existedUsername) {

        throw new Error(
            "Tên tài khoản đã tồn tại."
        );

    }


    // CHECK EMAIL

    const existedEmail =
        await prisma.user.findFirst({

            where: {

                email,

                NOT: {
                    id: userId,
                },

            },

        });

    if (existedEmail) {

        throw new Error(
            "Email đã được sử dụng."
        );

    }


    // GET ROLE

    const role =
        await prisma.role.findUnique({

            where: {
                name: roleName,
            },

        });

    if (!role) {

        throw new Error(
            "Không tìm thấy chức vụ."
        );

    }


    // UPDATE

    return await prisma.user.update({

        where: {
            id: userId,
        },

        data: {

            username,

            email,

            roleId: role.id,

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

            branch: {

                select: {

                    id: true,
                    name: true,

                },

            },

        },

    });

};


// ========================================
// TOGGLE STAFF STATUS
// ========================================

const toggleStatus = async (
    branchId,
    userId
) => {

    branchId = Number(branchId);
    userId = Number(userId);


    const staff =
        await prisma.user.findFirst({

            where: {

                id: userId,

                branchId,

                role: {

                    name: {

                        in: [
                            "ORDER",
                            "KITCHEN",
                        ],

                    },

                },

            },

        });


    if (!staff) {

        throw new Error(
            "Nhân viên không tồn tại trong chi nhánh này."
        );

    }


    return await prisma.user.update({

        where: {
            id: userId,
        },

        data: {

            isActive:
                !staff.isActive,

        },

        select: {

            id: true,

            username: true,

            email: true,

            isActive: true,

            role: {

                select: {
                    name: true,
                },

            },

        },

    });

};


module.exports = {

    getAll,
    getById,
    create,
    update,
    toggleStatus,

};