const foodService = require("./food.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {
  try {
    const foods = await foodService.getAll();

    return response.success(
      res,
      "Lấy danh sách món ăn thành công.",
      foods
    );
  } catch (error) {
    return response.error(res, error.message, 500);
  }
};

const getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const food = await foodService.getById(id);
    return response.success(
      res,
      "Lấy món ăn thành công.",
      food
    );
  } catch (error) {
    return response.error(res, error.message, 404);
  }
};

const create = async (req, res) => {
  try {
    const food = await foodService.create(req.body);
    return response.success(
      res,
      "Thêm món ăn thành công.",
      food,
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

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const food = await foodService.update(
      id,
      req.body
    );
    return response.success(
      res,
      "Cập nhật món ăn thành công.",
      food
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
    await foodService.remove(id);
    return response.success(
      res,
      "Xóa món ăn thành công."
    );
  } catch (error) {
    return response.error(
      res,
      error.message,
      400
    );
  }
};

const getByBranch = async (req, res) => {

    try {

        const branchId = req.user.branchId;

        const data = await foodService.getByBranch(branchId);

        res.json({
            success: true,
            data,
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message,
        });

    }

};

const getByQrCode = async (req, res) => {

    try {

        const data =
            await foodService.getByQrCode(
                req.params.qrCode
            );

        res.json({
            success: true,
            data,
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message,
        });

    }

};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getByBranch,
    getByQrCode,
};