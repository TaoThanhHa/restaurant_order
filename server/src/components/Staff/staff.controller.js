const staffService = require("./staff.service");
const response = require("../../utils/response");

// ========================================
// GET ALL STAFF
// ========================================

const getAll = async (req, res) => {
    try {
        const branchId = req.user?.branchId;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const data = await staffService.getAll(branchId);

        return response.success(
            res,
            "Lấy danh sách nhân viên thành công.",
            data
        );
    } catch (error) {
        console.error("GET ALL STAFF ERROR:", error);

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
        const branchId = req.user?.branchId;
        const userId = req.params.id;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const staff = await staffService.getById(
            branchId,
            userId
        );

        return response.success(
            res,
            "Lấy thông tin nhân viên thành công.",
            staff
        );
    } catch (error) {
        console.error("GET STAFF BY ID ERROR:", error);

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
        const branchId = req.user?.branchId;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const staff = await staffService.create(
            branchId,
            req.body
        );

        return response.success(
            res,
            "Tạo tài khoản nhân viên thành công.",
            staff,
            201
        );
    } catch (error) {
        console.error("CREATE STAFF ERROR:", error);

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
        const branchId = req.user?.branchId;
        const userId = req.params.id;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const staff = await staffService.update(
            branchId,
            userId,
            req.body
        );

        return response.success(
            res,
            "Cập nhật nhân viên thành công.",
            staff
        );
    } catch (error) {
        console.error("UPDATE STAFF ERROR:", error);

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
        const branchId = req.user?.branchId;
        const userId = req.params.id;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const staff = await staffService.toggleStatus(
            branchId,
            userId
        );

        return response.success(
            res,
            "Cập nhật trạng thái nhân viên thành công.",
            staff
        );
    } catch (error) {
        console.error(
            "TOGGLE STAFF STATUS ERROR:",
            error
        );

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
