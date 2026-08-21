const categoryService = require("./category.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {
  try {
    const categories = await categoryService.getAll();

    return response.success(
      res,
      "Lấy danh sách danh mục thành công.",
      categories
    );
  } catch (error) {
    return response.error(res, error.message, 500);
  }
};

const getById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const category = await categoryService.getById(id);
        return response.success(
            res,
            "Lấy danh mục thành công.",
            category
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            404
        );
    }
};

//Thêm danh mục
const create = async (req, res) => {
  try {
    const result = await categoryService.create(req.body);

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

//Cập nhật danh mục
const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await categoryService.update(
            id,
            req.body
        );
        return response.success(
            res,
            "Cập nhật danh mục thành công.",
            result
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            400
        );
    }
};

const remove = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await categoryService.remove(id);
        return response.success(
            res,
            "Xóa danh mục thành công."
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
  remove,
};