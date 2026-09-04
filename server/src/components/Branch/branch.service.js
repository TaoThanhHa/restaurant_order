const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");
const mailService = require("../Mail/mail.server");
  
// GENERATE PASSWORD
const generatePassword = () => {

    return crypto
        .randomBytes(8)
        .toString("base64")
        .replace(/[+/=]/g, "")
        .substring(0, 10);

};

const getAll = async () => {

    return await prisma.branch.findMany({

        select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            isActive: true,
            createdAt: true,
        },

        orderBy: {
            id: "asc",
        },

    });

};

const getById = async (id) => {

    const branch = await prisma.branch.findUnique({

        where: {
            id,
        },

        select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            isActive: true,
            createdAt: true,
        },

    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

    return branch;

};

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
            mustChangePassword: true,

            role: {
                select: {
                    name: true,
                },
            },

            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },

            createdAt: true,
        },

    });

    if (!user) {
        throw new Error("Tài khoản không tồn tại.");
    }

    return user;
};

  
// CREATE
const create = async (data) => {

    const name = data.name?.trim();
    const address = data.address?.trim() || null;
    const phone = data.phone?.trim() || null;
    const email = data.email?.trim().toLowerCase();

    if (!name) {
        throw new Error("Tên chi nhánh không được để trống.");
    }

    if (!email) {
        throw new Error("Email không được để trống.");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Email không hợp lệ.");
    }

    const existedBranch = await prisma.branch.findUnique({
        where: {
            email,
        },
    });

    if (existedBranch) {
        throw new Error("Email chi nhánh đã tồn tại.");
    }

    const existedUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existedUser) {
        throw new Error("Email tài khoản đã tồn tại.");
    }

    const cashierRole = await prisma.role.findUnique({

        where: {
            name: "BRANCH",
        },

    });

    if (!cashierRole) {
        throw new Error("Không tìm thấy role BRANCH.");
    }

    const tempPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(
        tempPassword,
        10
    );

    const result = await prisma.$transaction(async (tx) => {

        const branch = await tx.branch.create({

            data: {

                name,

                address,

                phone,

                email,

            },

        });

          
// COPY TOÀN BỘ MÓN ĂN CHO CHI NHÁNH MỚI
  

const foods = await tx.food.findMany({
    select: {
        id: true,
    },
});

if (foods.length > 0) {

    await tx.branchFood.createMany({

        data: foods.map(food => ({

            branchId: branch.id,

            foodId: food.id,

            status: "AVAILABLE",

        })),

    });

}

        await tx.user.create({

            data: {

                username: email,

                email,

                password: hashedPassword,

                roleId: cashierRole.id,

                branchId: branch.id,

                isActive: true,

                mustChangePassword: true,

            },

        });

        return branch;

    });

    try {

        await mailService.sendBranchAccount(

            result.name,

            email,

            tempPassword

        );

    } catch (err) {

        await prisma.user.deleteMany({

            where: {

                branchId: result.id,

            },

        });

        await prisma.branch.delete({

            where: {

                id: result.id,

            },

        });

        throw err;

    }

    return result;
};
  
// UPDATE
  

const update = async (id, data) => {

    const branch = await prisma.branch.findUnique({

        where: {
            id,
        },

        include: {

            users: {

                where: {

                    role: {

                        name: "BRANCH",

                    },

                },

                take: 1,

            },

        },

    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

    const name = data.name?.trim() ?? branch.name;

    const address = data.address?.trim() ?? branch.address;

    const phone = data.phone?.trim() ?? branch.phone;

    const email = data.email
        ? data.email.trim().toLowerCase()
        : branch.email;

    if (!validator.isEmail(email)) {
        throw new Error("Email không hợp lệ.");
    }

      
    // EMAIL ĐÃ TỒN TẠI?
      

    const existedBranch = await prisma.branch.findFirst({

        where: {

            email,

            NOT: {
                id,
            },

        },

    });

    if (existedBranch) {
        throw new Error("Email chi nhánh đã tồn tại.");
    }

    const existedUser = await prisma.user.findFirst({

        where: {

            email,

            NOT: {

                id: branch.users[0]?.id || 0,

            },

        },

    });

    if (existedUser) {
        throw new Error("Email tài khoản đã tồn tại.");
    }

      
    // EMAIL KHÔNG ĐỔI
      

    if (email === branch.email) {

        return await prisma.branch.update({

            where: {
                id,
            },

            data: {

                name,

                address,

                phone,

                isActive:
                    data.isActive ?? branch.isActive,

            },

        });

    }

      
    // EMAIL ĐỔI -> RESET PASSWORD
      

    const tempPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(
        tempPassword,
        10
    );

    const result = await prisma.$transaction(

        async (tx) => {

            const updatedBranch =
                await tx.branch.update({

                    where: {
                        id,
                    },

                    data: {

                        name,

                        address,

                        phone,

                        email,

                        isActive:
                            data.isActive ?? branch.isActive,

                    },

                });

            await tx.user.updateMany({

                where: {

                    branchId: id,

                    role: {

                        name: "BRANCH",

                    },

                },

                data: {

                    username: email,

                    email,

                    password: hashedPassword,

                    mustChangePassword: true,

                },

            });

            return updatedBranch;

        }

    );

  
// SEND EMAIL NEW ACCOUNT
  

    await mailService.sendBranchAccount(

        result.name,

        email,

        tempPassword

    );

    return result;

};

  
// REMOVE
  

const remove = async (id) => {

    const branch = await prisma.branch.findUnique({

        where: {
            id,
        },

        include: {

            users: {

                where: {

                    role: {

                        name: "BRANCH",

                    },

                },

            },

        },

    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

   await prisma.$transaction(async(tx)=>{

    await tx.branch.update({

        where:{
            id
        },

        data:{
            isActive:false
        }

    });

    await tx.user.updateMany({

        where:{

            branchId:id,

            role:{
                name:"BRANCH"
            }

        },

        data:{
            isActive:false
        }

    });

});
};

const toggleStatus = async (id) => {
    const branch = await prisma.branch.findUnique({
        where: { id },
    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại.");
    }

    return await prisma.branch.update({
        where: { id },
        data: {
            isActive: !branch.isActive,
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
        throw new Error("Tài khoản không tồn tại.");
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isMatch) {
        throw new Error("Mật khẩu hiện tại không đúng.");
    }

    if (!newPassword || newPassword.length < 6) {
        throw new Error(
            "Mật khẩu mới phải có ít nhất 6 ký tự."
        );
    }

    const password = await bcrypt.hash(
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

module.exports = {
    getAll,
    getById,
    getProfile,
    create,
    update,
    remove,
    toggleStatus,
    changePassword,
};