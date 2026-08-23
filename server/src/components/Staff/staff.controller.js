const staffService = require("./staff.service");
const response = require("../../utils/response");


// ========================================
// GET ALL STAFF
// ========================================

const getAll = async (req, res) => {
    try {

        const data = await staffService.getAll(
            req.params.branchId
        );

        return response.success(
            res,
            "Lấy danh sách nhân viên thành công.",
            data
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
// GET STAFF BY ID
// ========================================

const getById = async (req, res) => {
    try {

        const data = await staffService.getById(
            req.params.branchId,
            req.params.userId
        );

        return response.success(
            res,
            "Lấy thông tin nhân viên thành công.",
            data
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
// CREATE STAFF
// ========================================

const create = async (req, res) => {
    try {

        const data = await staffService.create(
            req.params.branchId,
            req.body
        );

        return response.success(
            res,
            "Tạo nhân viên thành công.",
            data
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
// UPDATE STAFF
// ========================================

const update = async (req, res) => {
    try {

        const data = await staffService.update(
            req.params.branchId,
            req.params.userId,
            req.body
        );

        return response.success(
            res,
            "Cập nhật nhân viên thành công.",
            data
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
// TOGGLE STATUS
// ========================================

const toggleStatus = async (req, res) => {
    try {

        const data = await staffService.toggleStatus(
            req.params.branchId,
            req.params.userId
        );

        return response.success(
            res,
            "Cập nhật trạng thái nhân viên thành công.",
            data
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
    create,
    update,
    toggleStatus,
};