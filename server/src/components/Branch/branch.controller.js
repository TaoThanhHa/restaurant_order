const branchService = require("./branch.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {

    try {

        const data = await branchService.getAll();

        return response.success(
            res,
            "Lấy danh sách chi nhánh thành công.",
            data
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

};

const getById = async (req, res) => {

    try {

        const data = await branchService.getById(
            Number(req.params.id)
        );

        return response.success(
            res,
            "Lấy chi nhánh thành công.",
            data
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            404
        );

    }

};

const getProfile = async (req, res) => {

    try {

        const user = await branchService.getProfile(
            req.user.id
        );

        return response.success(
            res,
            "Lấy thông tin tài khoản thành công.",
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

const create = async (req, res) => {

    try {

        const data = await branchService.create(
            req.body
        );

        return response.success(
            res,
            "Thêm chi nhánh thành công.",
            data,
            201
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            400
        );

    }

};

const update = async (req, res) => {

    try {

        const data = await branchService.update(
            Number(req.params.id),
            req.body
        );

        return response.success(
            res,
            "Cập nhật chi nhánh thành công.",
            data
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            400
        );

    }

};

const remove = async (req, res) => {

    try {

        await branchService.remove(
            Number(req.params.id)
        );

        return response.success(
            res,
            "Xóa chi nhánh thành công."
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            400
        );

    }

};

const toggleStatus = async (req, res) => {
    try {
        const branch = await branchService.toggleStatus(Number(req.params.id));

        res.json({
            message: branch.isActive
                ? "Mở khóa chi nhánh thành công."
                : "Khóa chi nhánh thành công.",
            data: branch,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};
const changePassword = async (req, res) => {

    try {

        await branchService.changePassword(
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