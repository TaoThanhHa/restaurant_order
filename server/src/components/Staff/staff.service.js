const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");
const mailService = require("../Mail/mail.server");

const STAFF_ROLES = ["ORDER", "CASHIER", "KITCHEN", "WAREHOUSE"];

const checkAccess = async (branchId, user) => {
    if (!user) throw new Error("Chưa xác thực người dùng.");

    const branch = await prisma.branch.findUnique({
        where: { id: Number(branchId) },
        select: { id: true, name: true, isActive: true, restaurantId: true },
    });

    if (!branch) throw new Error("Chi nhánh không tồn tại.");

    if (user.role === "ADMIN") {
        if (!user.restaurantId) {
            throw new Error("Tài khoản chưa được gán nhà hàng.");
        }

        if (Number(branch.restaurantId) !== Number(user.restaurantId)) {
            throw new Error("Bạn không có quyền truy cập chi nhánh này.");
        }
    } else if (Number(branch.id) !== Number(user.branchId)) {
        throw new Error("Bạn không có quyền truy cập chi nhánh này.");
    }

    return branch;
};

const getAdminBranch = async user => {
    if (!user?.restaurantId) {
        throw new Error("Tài khoản chưa được gán nhà hàng.");
    }

    const branches = await prisma.branch.findMany({
        where: { restaurantId: Number(user.restaurantId) },
        select: { id: true },
        orderBy: { id: "asc" },
    });

    if (!branches.length) {
        throw new Error("Nhà hàng chưa có chi nhánh.");
    }

    if (branches.length > 1) {
        throw new Error("Vui lòng chọn chi nhánh.");
    }

    return branches[0].id;
};

const resolveBranch = async (branchId, user) => {
    if (user?.role === "ADMIN") {
        branchId = branchId ? Number(branchId) : await getAdminBranch(user);
    } else {
        branchId = Number(user?.branchId);
    }

    if (!branchId) {
        throw new Error("Chi nhánh không hợp lệ.");
    }

    return checkAccess(branchId, user);
};

const generatePassword = () => {
    return crypto.randomBytes(8).toString("base64").replace(/[+/=]/g, "").substring(0, 10);
};

const getAll = async (branchId, user) => {
    const branch = await resolveBranch(branchId, user);

    const staff = await prisma.user.findMany({
        where: {
            branchId: branch.id,
            role: {
                name: { in: STAFF_ROLES },
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
        orderBy: { id: "asc" },
    });

    return { branch, staff };
};

const getById = async (branchId, userId, user) => {
    const branch = await resolveBranch(branchId, user);

    const staff = await prisma.user.findFirst({
        where: {
            id: Number(userId),
            branchId: branch.id,
            role: {
                name: { in: STAFF_ROLES },
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

    if (!staff) {
        throw new Error("Nhân viên không tồn tại trong chi nhánh này.");
    }

    return staff;
};

const create = async (branchId, data, user) => {
    const branch = await resolveBranch(branchId, user);

    if (!branch.isActive) {
        throw new Error("Chi nhánh đang bị khóa, không thể thêm nhân viên.");
    }

    const username = data.username?.trim();
    const email = data.email?.trim().toLowerCase();
    const roleName = data.role?.trim().toUpperCase();

    if (!username) {
        throw new Error("Tên tài khoản không được để trống.");
    }

    if (!email) {
        throw new Error("Email không được để trống.");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Email không hợp lệ.");
    }

    if (!STAFF_ROLES.includes(roleName)) {
        throw new Error("Chức vụ không hợp lệ.");
    }

    const existedUsername = await prisma.user.findUnique({
        where: { username },
    });

    if (existedUsername) {
        throw new Error("Tên tài khoản đã tồn tại.");
    }

    const existedEmail = await prisma.user.findUnique({
        where: { email },
    });

    if (existedEmail) {
        throw new Error("Email đã được sử dụng.");
    }

    const role = await prisma.role.findUnique({
        where: { name: roleName },
    });

    if (!role) {
        throw new Error(`Không tìm thấy chức vụ ${roleName}.`);
    }

    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const staff = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            roleId: role.id,
            branchId: branch.id,
            restaurantId: branch.restaurantId,
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

    try {
        await mailService.sendStaffAccount(
            branch.name,
            username,
            email,
            roleName,
            tempPassword
        );
    } catch (error) {
        await prisma.user.delete({
            where: { id: staff.id },
        });

        throw error;
    }

    return staff;
};

const update = async (branchId, userId, data, user) => {
    const branch = await resolveBranch(branchId, user);

    if (!branch.isActive) {
        throw new Error("Chi nhánh đang bị khóa, không thể chỉnh sửa nhân viên.");
    }

    const staff = await prisma.user.findFirst({
        where: {
            id: Number(userId),
            branchId: branch.id,
            role: {
                name: { in: STAFF_ROLES },
            },
        },
        include: { role: true },
    });

    if (!staff) {
        throw new Error("Nhân viên không tồn tại trong chi nhánh này.");
    }

    const username = data.username?.trim() || staff.username;
    const roleName = data.role?.trim().toUpperCase() || staff.role.name;

    if (!username) {
        throw new Error("Tên tài khoản không được để trống.");
    }

    if (!STAFF_ROLES.includes(roleName)) {
        throw new Error("Không thể gán chức vụ này.");
    }

    const existedUsername = await prisma.user.findFirst({
        where: {
            username,
            NOT: { id: Number(userId) },
        },
    });

    if (existedUsername) {
        throw new Error("Tên tài khoản đã tồn tại.");
    }

    const role = await prisma.role.findUnique({
        where: { name: roleName },
    });

    if (!role) {
        throw new Error("Không tìm thấy chức vụ.");
    }

    return prisma.user.update({
        where: { id: Number(userId) },
        data: {
            username,
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

const toggleStatus = async (branchId, userId, user) => {
    const branch = await resolveBranch(branchId, user);

    if (!branch.isActive) {
        throw new Error("Chi nhánh đang bị khóa, không thể thay đổi trạng thái nhân viên.");
    }

    const staff = await prisma.user.findFirst({
        where: {
            id: Number(userId),
            branchId: branch.id,
            role: {
                name: { in: STAFF_ROLES },
            },
        },
    });

    if (!staff) {
        throw new Error("Nhân viên không tồn tại trong chi nhánh này.");
    }

    return prisma.user.update({
        where: { id: Number(userId) },
        data: {
            isActive: !staff.isActive,
        },
        select: {
            id: true,
            username: true,
            email: true,
            isActive: true,
            role: {
                select: {
                    id: true,
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
