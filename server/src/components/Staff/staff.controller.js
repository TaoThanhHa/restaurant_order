const staffService = require("./staff.service");
const response = require("../../utils/response");

const getBranchId = async user => {
    if (user?.branchId) {
        return Number(user.branchId);
    }

    if (
        user?.role === "ADMIN" &&
        user?.restaurantMode === "SINGLE" &&
        user?.restaurantId
    ) {
        const branch = await staffService.getSingleBranch(
            user.restaurantId
        );

        return branch?.id || null;
    }

    return null;
};

const getAll = async (req, res) => {
    try {
        const branchId = await getBranchId(req.user);

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const data = await staffService.getAll(
            branchId,
            req.user
        );

        return response.success(
            res,
            "Lấy danh sách nhân viên thành công.",
            data
        );
    } catch (error) {
        console.error(
            "GET ALL STAFF ERROR:",
            error
        );

        return response.error(
            res,
            error.message,
            400
        );
    }
};

const getById = async (req, res) => {
    try {
        const branchId = await getBranchId(req.user);

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const staff = await staffService.getById(
            branchId,
            req.params.userId,
            req.user
        );

        return response.success(
            res,
            "Lấy thông tin nhân viên thành công.",
            staff
        );
    } catch (error) {
        console.error(
            "GET STAFF BY ID ERROR:",
            error
        );

        return response.error(
            res,
            error.message,
            400
        );
    }
};

const create = async (req, res) => {
    try {
        const branchId = await getBranchId(req.user);

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const staff = await staffService.create(
            branchId,
            req.body,
            req.user
        );

        return response.success(
            res,
            "Tạo tài khoản nhân viên thành công.",
            staff,
            201
        );
    } catch (error) {
        console.error(
            "CREATE STAFF ERROR:",
            error
        );

        return response.error(
            res,
            error.message,
            400
        );
    }
};

const update = async (req, res) => {
    try {
        const branchId = await getBranchId(req.user);

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const staff = await staffService.update(
            branchId,
            req.params.userId,
            req.body,
            req.user
        );

        return response.success(
            res,
            "Cập nhật nhân viên thành công.",
            staff
        );
    } catch (error) {
        console.error(
            "UPDATE STAFF ERROR:",
            error
        );

        return response.error(
            res,
            error.message,
            400
        );
    }
};

const toggleStatus = async (req, res) => {
    try {
        const branchId = await getBranchId(req.user);

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                403
            );
        }

        const staff =
            await staffService.toggleStatus(
                branchId,
                req.params.userId,
                req.user
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