const customerAuthService = require("./customerAuth.service");

const response = require("../../utils/response");

const guest = async (req, res) => {

    try {

        const result =
            await customerAuthService.guest(
                req.body
            );

        return response.success(
            res,
            "Đăng nhập khách thành công.",
            result
        );

    } catch (error) {

        console.error(
            "Lỗi đăng nhập Guest:",
            error
        );

        return response.error(
            res,
            error.message ||
                "Đăng nhập khách thất bại.",
            400
        );

    }

};

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            tableId,
            deviceId,
        } = req.body;


        const result =
            await customerAuthService.register({

                name,
                email,
                phone,
                password,
                tableId,
                deviceId,

            });


        return response.success(
            res,
            "Đăng ký tài khoản thành công.",
            result,
            201
        );

    } catch (error) {

        console.error(
            "Lỗi đăng ký khách hàng:",
            error
        );

        return response.error(
            res,
            error.message ||
                "Đăng ký thất bại.",
            400
        );

    }

};

const login = async (req, res) => {

    try {

        const {
            identifier,
            password,
            qrCode,
            deviceId,
        } = req.body;


        const result =
            await customerAuthService.login({

                identifier,
                password,
                qrCode,
                deviceId,

            });


        return response.success(
            res,
            "Đăng nhập thành công.",
            result
        );

    } catch (error) {

        console.error(
            "Lỗi đăng nhập khách hàng:",
            error
        );

        return response.error(
            res,
            error.message ||
                "Đăng nhập thất bại.",
            401
        );

    }

};

const profile = async (req, res) => {

    try {

        const customer =
            await customerAuthService.profile(
                req.customer.id
            );


        return response.success(
            res,
            "Lấy thông tin thành công.",
            customer
        );

    } catch (error) {

        console.error(
            "Lỗi lấy profile khách hàng:",
            error
        );

        return response.error(
            res,
            error.message ||
                "Không thể lấy thông tin khách hàng.",
            404
        );

    }

};

const getTable = async (req, res) => {

    try {

        const table =
            await customerAuthService.getTable(
                req.params.qrCode
            );


        return response.success(
            res,
            "Lấy thông tin bàn thành công.",
            table
        );

    } catch (error) {

        console.error(
            "Lỗi lấy thông tin bàn:",
            error
        );

        return response.error(
            res,
            error.message ||
                "Không thể lấy thông tin bàn.",
            400
        );

    }

};

const forgotPassword = async (req, res) => {
    try {

        const result =
            await customerAuthService.forgotPassword(
                req.body.email
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Không thể gửi OTP.",
        });
    }
};


// ======================================================
// VERIFY OTP
// ======================================================

const verifyOtp = async (req, res) => {
    try {

        const result =
            await customerAuthService.verifyOtp({
                email: req.body.email,
                otp: req.body.otp,
            });

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "OTP không hợp lệ.",
        });
    }
};


// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
    try {

        const result =
            await customerAuthService.resetPassword({
                email: req.body.email,
                otp: req.body.otp,
                password: req.body.password,
            });

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Không thể đổi mật khẩu.",
        });
    }
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
}