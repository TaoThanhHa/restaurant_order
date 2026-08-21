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

        if (req.file) {
            data.avatar =
                `/uploads/customers/${req.file.filename}`;
        }

        const customer =
            await customerService.updateProfile(
                req.customer.id,
                data
            );

        return response.success(
            res,
            "Cập nhật thông tin thành công.",
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

/* // ======================================================
// CREATE GUEST
// ======================================================

const createGuest = async (
    req,
    res
) => {

    try {

        const result =
            await customerService.createGuest(
                req.body
            );

        return response.success(
            res,
            "Tạo khách thành công.",
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


// ======================================================
// CREATE CUSTOMER
// ======================================================

const create = async (
    req,
    res
) => {

    try {

        const result =
            await customerService.create(
                req.body
            );

        return response.success(
            res,
            "Tạo khách hàng thành công.",
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


// ======================================================
// GET BY ID
// ======================================================

const getById = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.getById(
                Number(req.params.id)
            );

        return response.success(
            res,
            "Lấy thông tin khách hàng thành công.",
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


// ======================================================
// GET BY GUEST TOKEN
// ======================================================

const getByGuestToken = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.getByGuestToken(
                req.params.token
            );

        return response.success(
            res,
            "Lấy thông tin khách hàng thành công.",
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


// ======================================================
// UPDATE CUSTOMER - ADMIN/CASHIER
// ======================================================

const update = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.update(
                Number(req.params.id),
                req.body
            );

        return response.success(
            res,
            "Cập nhật khách hàng thành công.",
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


// ======================================================
// DELETE CUSTOMER
// ======================================================

const remove = async (
    req,
    res
) => {

    try {

        await customerService.remove(
            Number(req.params.id)
        );

        return response.success(
            res,
            "Xóa khách hàng thành công."
        );

    } catch (error) {

        return response.error(
            res,
            error.message,
            400
        );

    }

}; */

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
    /* createGuest,
    create,
    getById,
    getByGuestToken,
    update,
    remove, */
    sendChangeEmailOtp,
    verifyChangeEmailOtp,
};