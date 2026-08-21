const customerAuthService = require("./customerAuth.service");
const response = require("../../utils/response");

// GUEST LOGIN
const guest = async (req, res) => {
    console.log(req.body);

    try {
        const result = await customerAuthService.guest(req.body);

        return response.success(
            res,
            "Đăng nhập khách thành công",
            result
        );
    } catch (err) {
        console.log(err);

        return response.error(
            res,
            err.message,
            400
        );
    }
};

// REGISTER
const register = async (req, res) => {
    try {
        const result = await customerAuthService.register(req.body);

        return response.success(
            res,
            "Đăng ký thành công.",
            result,
            201
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            400
        );
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const result = await customerAuthService.login(req.body);

        return response.success(
            res,
            "Đăng nhập thành công.",
            result
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            401
        );
    }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    try {
        await customerAuthService.forgotPassword(
            req.body.email
        );

        return response.success(
            res,
            "Nếu email tồn tại, mật khẩu mới đã được gửi."
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            400
        );
    }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        await customerAuthService.resetPassword(
            req.body
        );

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

// PROFILE
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
        return response.error(
            res,
            error.message,
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

        return response.error(
            res,
            error.message,
            400
        );

    }

};

module.exports = {
    guest,
    register,
    login,
    forgotPassword,
    resetPassword,
    profile,
    getTable,
};