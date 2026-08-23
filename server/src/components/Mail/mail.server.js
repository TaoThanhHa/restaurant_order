const transporter = require("../../config/mail");

const sendBranchAccount = async (
    branchName,
    email,
    password
) => {
    try {
        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Thông tin tài khoản chi nhánh",
            html: `
                <div style="font-family:Arial,sans-serif;padding:20px">
                    <h2>Xin chào!</h2>

                    <p>
                        Tài khoản cho chi nhánh
                        <b>${branchName}</b>
                        đã được tạo thành công.
                    </p>

                    <table
                        cellpadding="8"
                        cellspacing="0"
                        border="1"
                        style="border-collapse:collapse"
                    >
                        <tr>
                            <td><b>Email đăng nhập</b></td>
                            <td>${email}</td>
                        </tr>

                        <tr>
                            <td><b>Mật khẩu tạm</b></td>
                            <td>${password}</td>
                        </tr>
                    </table>

                    <br/>

                    <p>
                        Vui lòng đăng nhập và đổi mật khẩu ngay
                        sau lần đăng nhập đầu tiên.
                    </p>
                </div>
            `,
        });

    } catch (err) {

        console.error(err);

        throw new Error(
            "Email không tồn tại hoặc không thể gửi email."
        );

    }
};


// ========================================
// GỬI OTP ĐỔI EMAIL
// ========================================

const sendChangeEmailOtp = async (
    email,
    otp
) => {

    try {

        await transporter.sendMail({

            from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`,

            to: email,

            subject: "Mã OTP xác nhận đổi email",

            html: `
                <div
                    style="
                        font-family:Arial,sans-serif;
                        padding:20px;
                    "
                >

                    <h2>
                        Xác nhận đổi email
                    </h2>

                    <p>
                        Bạn vừa yêu cầu thay đổi email
                        đăng nhập.
                    </p>

                    <p>
                        Mã OTP của bạn là:
                    </p>

                    <div
                        style="
                            font-size:32px;
                            font-weight:bold;
                            letter-spacing:8px;
                            margin:20px 0;
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

                    <hr/>

                    <small>
                        Đây là email tự động,
                        vui lòng không trả lời.
                    </small>

                </div>
            `,
        });

    } catch (err) {

        console.error(err);

        throw new Error(
            "Không thể gửi OTP đến email mới."
        );

    }
};

const sendStaffAccount = async (
    branchName,
    username,
    email,
    role,
    password
) => {

    const roleName =
        role === "ORDER"
            ? "Nhân viên order"
            : "Nhân viên bếp";

    await transporter.sendMail({

        to: email,

        subject:
            "Thông tin tài khoản nhân viên",

        html: `

            <h2>Chào mừng bạn đến với ${branchName}</h2>

            <p>
                Bạn đã được tạo tài khoản
                <strong>${roleName}</strong>.
            </p>

            <p>
                <strong>Tên tài khoản:</strong>
                ${username}
            </p>

            <p>
                <strong>Email:</strong>
                ${email}
            </p>

            <p>
                <strong>Mật khẩu:</strong>
                ${password}
            </p>

            <p>
                Vui lòng đăng nhập và đổi mật khẩu.
            </p>

        `,

    });

};


module.exports = {
    sendBranchAccount,
    sendChangeEmailOtp,
    sendStaffAccount,
};