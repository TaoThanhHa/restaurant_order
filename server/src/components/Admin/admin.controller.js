const adminService = require("./admin.service");
const response = require("../../utils/response");


// ========================================
// PROFILE
// ========================================

const getProfile = async (req, res) => {

    try {

        const data =
            await adminService.getProfile(
                req.user.id
            );


        return response.success(

            res,

            "Lấy thông tin tài khoản thành công.",

            data

        );

    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );


        return response.error(

            res,

            error.message,

            400

        );

    }

};

// ========================================
// UPDATE RESTAURANT
// ========================================

const updateRestaurant = async (
    req,
    res
) => {

    try {

        const data =
            await adminService.updateRestaurant(

                req.user.id,

                req.body

            );


        return response.success(

            res,

            "Cập nhật thông tin quán thành công.",

            data

        );

    } catch (error) {

        console.error(
            "UPDATE RESTAURANT ERROR:",
            error
        );


        return response.error(

            res,

            error.message,

            400

        );

    }

};


// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword = async (req, res) => {

    try {

        await adminService.changePassword(
            req.user.id,
            req.body.currentPassword,
            req.body.newPassword
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


// ========================================
// REQUEST CHANGE EMAIL
// ========================================

const requestChangeEmail = async (req, res) => {

    try {

        await adminService.requestChangeEmail(
            req.user.id,
            req.body.newEmail
        );

        return response.success(
            res,
            "OTP đã được gửi đến email."
        );

    } catch (error) {

        return response.error(
            res,
            error.message,
            400
        );

    }

};


// ========================================
// VERIFY CHANGE EMAIL
// ========================================

const verifyChangeEmail = async (req, res) => {

    try {

        await adminService.verifyChangeEmail(
            req.user.id,
            req.body.otp
        );

        return response.success(
            res,
            "Đổi email thành công."
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
    getProfile,
    updateRestaurant,
    changePassword,
    requestChangeEmail,
    verifyChangeEmail,
};