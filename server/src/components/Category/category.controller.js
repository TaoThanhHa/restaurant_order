const categoryService = require("./category.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {
    try {
        console.log("CATEGORY REQ USER:", req.user);
        console.log("CATEGORY REQ CUSTOMER:", req.customer);

        const user = req.user || req.customer;

        const categories = await categoryService.getAll(user);

        return response.success(
            res,
            "Lấy danh sách danh mục thành công.",
            categories
        );
    } catch (error) {
        console.error("CATEGORY ERROR:", error);

        return response.error(
            res,
            error.message,
            500
        );
    }
};

const getById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = req.user || req.customer;
        const category = await categoryService.getById(id, user);

        return response.success(
            res,
            "Lấy danh mục thành công.",
            category
        );
    } catch (error) {
        return response.error(res, error.message, 404);
    }
};

const create = async (req, res) => {
    try {
        const result = await categoryService.create(
            req.body,
            req.user
        );

        return response.success(
            res,
            "Thêm danh mục thành công.",
            result,
            201
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await categoryService.update(
            id,
            req.body,
            req.user
        );

        return response.success(
            res,
            "Cập nhật danh mục thành công.",
            result
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const remove = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await categoryService.remove(id, req.user);

        return response.success(
            res,
            "Xóa danh mục thành công."
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
