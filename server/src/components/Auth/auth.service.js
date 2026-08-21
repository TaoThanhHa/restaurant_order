const bcrypt = require("bcrypt");

const prisma = require("../../config/prisma");
const mail = require("../../config/mail");
const { generateToken } = require("../../utils/jwt");

const login = async (email, password) => {

    const user = await prisma.user.findUnique({

        where: {
            email,
        },

        include: {

            role: true,

            branch: true,

        },

    });

      
    // USER KHÔNG TỒN TẠI
      

    if (!user) {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
    }

      
    // USER BỊ KHÓA
      

    if (!user.isActive) {
        throw new Error("Tài khoản đã bị khóa.");
    }

      
    // BRANCH BỊ KHÓA
      

    if (
        user.branch &&
        !user.branch.isActive
    ) {
        throw new Error("Chi nhánh đã bị khóa.");
    }

      
    // PASSWORD
      

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
    }

      
    // TOKEN
      

    const token = generateToken(user);

    return {

        token,

        mustChangePassword:
            user.mustChangePassword,

        user: {

            id: user.id,

            username: user.username,

            email: user.email,

            role: user.role.name,

            branchId: user.branchId,

            branch: user.branch,

        },

    };

};
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: true,
      branch: true,
    },
  });

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  return {

    id: user.id,

    username: user.username,

    email: user.email,

    role: user.role.name,

    branchId: user.branchId,

    branch: user.branch,

    mustChangePassword: user.mustChangePassword,

    createdAt: user.createdAt,

};
};

const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return;
    }

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    await prisma.passwordResetOtp.deleteMany({
        where: { email }
    });

    await prisma.passwordResetOtp.create({
        data: {
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        }
    });

    try {
        await mail.sendMail({
            from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Mã OTP đặt lại mật khẩu",
            html: `
                <div style="font-family:Arial,sans-serif;padding:20px">
                    <h2>Đặt lại mật khẩu</h2>

                    <p>Mã OTP của bạn là:</p>

                    <h1 style="letter-spacing:8px">
                        ${otp}
                    </h1>

                    <p>
                        OTP có hiệu lực trong
                        <b>5 phút</b>.
                    </p>

                    <hr/>

                    <small>
                        Đây là email tự động, vui lòng không trả lời.
                    </small>
                </div>
            `,
        });
    } catch (err) {
        console.error(err);

        throw new Error(
            "Không thể gửi email."
        );
    }
};
const resetPassword = async ({
    email,
    otp,
    password
}) => {

    const record =
        await prisma.passwordResetOtp.findFirst({

            where: {
                email,
                otp
            }

        });

    if (!record) {
        throw new Error("OTP không đúng.");
    }

    if (record.expiresAt < new Date()) {
        throw new Error("OTP đã hết hạn.");
    }

    const hash = await bcrypt.hash(password,10);

    await prisma.user.update({

        where:{
            email
        },

        data:{
            password:hash,
            mustChangePassword:false
        }

    });

    await prisma.passwordResetOtp.deleteMany({

        where:{
            email
        }

    });

};

module.exports = {
  login,
  getProfile,
  forgotPassword,
  resetPassword,
};
