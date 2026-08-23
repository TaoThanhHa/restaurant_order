const customerService =
    require("./customer.service");

const response =
    require("../../utils/response");

// ======================================================
// UPDATE PROFILE
// ======================================================

const updateProfile = async (req, res) => {
    try {
        const data = {
            name: req.body.name,
        };

        const customer =
            await customerService.updateProfile(
                req.customer.id,
                data
            );

        return response.success(
            res,
            "Cập nhật họ và tên thành công.",
            customer
        );

    } catch (error) {
        console.error(
            "UPDATE CUSTOMER PROFILE ERROR:",
            error
        );

        return response.error(
            res,
            error.message ||
                "Không thể cập nhật họ và tên.",
            400
        );
    }
};

const updatePhone = async (req, res) => {

    try {

        const customer =
            await customerService.updatePhone(
                req.customer.id,
                req.body.phone
            );

        return response.success(
            res,
            "Cập nhật số điện thoại thành công.",
            customer
        );

    } catch (error) {

        return response.error(
            res,
            error.message,
            400
        );
    }
};

const changePassword = async (req, res) => {

    try {

        const customer =
            await customerService.changePassword(
                req.customer.id,
                req.body.currentPassword,
                req.body.newPassword
            );

        return response.success(
            res,
            "Đổi mật khẩu thành công.",
            customer
        );

    } catch (error) {

        return response.error(
            res,
            error.message,
            400
        );
    }
};

const sendChangeEmailOtp = async (
    req,
    res
) => {

    try {

        await customerService.sendChangeEmailOtp(
            req.customer.id,
            req.body.email
        );

        return response.success(
            res,
            "Mã OTP đã được gửi đến email mới."
        );

    } catch (error) {

        return response.error(
            res,
            error.message,
            400
        );
    }
};

const verifyChangeEmailOtp = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.verifyChangeEmailOtp(
                req.customer.id,
                req.body.email,
                req.body.otp
            );

        return response.success(
            res,
            "Đổi email thành công.",
            customer
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
    updateProfile,
    updatePhone,
    changePassword,
    sendChangeEmailOtp,
    verifyChangeEmailOtp,
};