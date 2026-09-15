const authService = require("./auth.service");
const response = require("../../utils/response");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return response.error(
                res,
                "Vui lòng nhập đầy đủ email và mật khẩu.",
                400
            );
        }

        const result = await authService.login(email, password);

        return response.success(
            res,
            "Đăng nhập thành công.",
            result
        );
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return response.error(
            res,
            error.message,
            401
        );
    }
};

const profile = async (req, res) => {
    try {
        const user = await authService.getProfile(req.user.id);

        return response.success(
            res,
            "Lấy thông tin thành công.",
            user
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            400
        );
    }
};

const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);

        return response.success(
            res,
            "Nếu email tồn tại, OTP đã được gửi."
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            400
        );
    }
};

const verifyOtp = async (req, res) => {
    try {
        await authService.verifyOtp(req.body);

        return response.success(
            res,
            "Xác thực OTP thành công."
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            400
        );
    }
};

const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body);

        return response.success(
            res,
            "Đổi mật khẩu thành công."
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            400
        );
    }
};

module.exports = {
    login,
    profile,
    forgotPassword,
    verifyOtp,
    resetPassword,
};