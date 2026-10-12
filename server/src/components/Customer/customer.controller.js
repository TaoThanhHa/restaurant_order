const customerService = require("./customer.service");
const response = require("../../utils/response");

const updateProfile = async (req, res) => {
    try {
        const data = { name: req.body.name };
        const customer = await customerService.updateProfile(req.customer.id, data);
        return response.success(res, "Cập nhật họ và tên thành công.", customer);
    } catch (error) {
        console.error("UPDATE CUSTOMER PROFILE ERROR:", error);
        return response.error(res, error.message || "Không thể cập nhật họ và tên.", 400);
    }
};

const updatePhone = async (req, res) => {
    try {
        const customer = await customerService.updatePhone(req.customer.id, req.body.phone);
        return response.success(res, "Cập nhật số điện thoại thành công.", customer);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const changePassword = async (req, res) => {
    try {
        const customer = await customerService.changePassword(
            req.customer.id,
            req.body.currentPassword,
            req.body.newPassword
        );
        return response.success(res, "Đổi mật khẩu thành công.", customer);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const sendChangeEmailOtp = async (req, res) => {
    try {
        await customerService.sendChangeEmailOtp(req.customer.id, req.body.email);
        return response.success(res, "Mã OTP đã được gửi đến email mới.");
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const verifyChangeEmailOtp = async (req, res) => {
    try {
        const customer = await customerService.verifyChangeEmailOtp(
            req.customer.id,
            req.body.email,
            req.body.otp
        );
        return response.success(res, "Đổi email thành công.", customer);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};


const guest = async (req, res) => {
    try {
        const result = await customerService.guest(req.body);
        return response.success(res, "Đăng nhập khách thành công.", result);
    } catch (error) {
        console.error("Lỗi đăng nhập Guest:", error);
        return response.error(res, error.message || "Đăng nhập khách thất bại.", 400);
    }
};

const register = async (req, res) => {
    try {
        const { name, email, phone, password, tableId, deviceId } = req.body;

        const result = await customerService.register({
            name,
            email,
            phone,
            password,
            tableId,
            deviceId
        });

        return response.success(res, "Đăng ký tài khoản thành công.", result, 201);
    } catch (error) {
        console.error("Lỗi đăng ký khách hàng:", error);
        return response.error(res, error.message || "Đăng ký thất bại.", 400);
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password, qrCode, deviceId } = req.body;

        const result = await customerService.login({
            identifier,
            password,
            qrCode,
            deviceId
        });

        return response.success(res, "Đăng nhập thành công.", result);
    } catch (error) {
        console.error("Lỗi đăng nhập khách hàng:", error);
        return response.error(res, error.message || "Đăng nhập thất bại.", 401);
    }
};

const profile = async (req, res) => {
    try {
        const customer = await customerService.profile(req.customer.id);
        return response.success(res, "Lấy thông tin thành công.", customer);
    } catch (error) {
        console.error("Lỗi lấy profile khách hàng:", error);
        return response.error(res, error.message || "Không thể lấy thông tin khách hàng.", 404);
    }
};

const getTable = async (req, res) => {
    try {
        const table = await customerService.getTable(req.params.qrCode);
        return response.success(res, "Lấy thông tin bàn thành công.", table);
    } catch (error) {
        console.error("Lỗi lấy thông tin bàn:", error);
        return response.error(res, error.message || "Không thể lấy thông tin bàn.", 400);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const result = await customerService.forgotPassword(req.body.email);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Không thể gửi OTP."
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const result = await customerService.verifyOtp({
            email: req.body.email,
            otp: req.body.otp
        });

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "OTP không hợp lệ."
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const result = await customerService.resetPassword({
            email: req.body.email,
            otp: req.body.otp,
            password: req.body.password
        });

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Không thể đổi mật khẩu."
        });
    }
};


module.exports = {
    updateProfile,
    updatePhone,
    changePassword,
    sendChangeEmailOtp,
    verifyChangeEmailOtp,
    guest,
    register,
    login,
    profile,
    getTable,
    forgotPassword,
    verifyOtp,
    resetPassword
};