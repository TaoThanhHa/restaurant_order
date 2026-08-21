const floorService = require("./floor.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {
  try {
    const floors = await floorService.getAll(req.user);
    return response.success(
      res,
      "Lấy danh sách tầng thành công.",
      floors
    );
  } catch (error) {
    return response.error(res, error.message, 500);
  }
};

const getByBranch = async (req, res, next) => {
    try {
        const data = await floorService.getByBranch(
            req.params.branchId
        );

        res.json({
            success: true,
            message: "Lấy danh sách tầng thành công.",
            data,
        });
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res) => {
  try {
    const floor = await floorService.getById(
      Number(req.params.id)
    );
    return response.success(
      res,
      "Lấy tầng thành công.",
      floor
    );
  } catch (error) {
    return response.error(res, error.message, 404);
  }
};

const create = async (req, res) => {
  try {
    const floor = await floorService.create(req.body);
    return response.success(
      res,
      "Thêm tầng thành công.",
      floor,
      201
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const update = async (req, res) => {
  try {
    const floor = await floorService.update(
      Number(req.params.id),
      req.body
    );
    return response.success(
      res,
      "Cập nhật tầng thành công.",
      floor
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const remove = async (req, res) => {
  try {
    await floorService.remove(
      Number(req.params.id)
    );
    return response.success(
      res,
      "Xóa tầng thành công."
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

module.exports = {
    getAll,
    getByBranch,
    getById,
    create,
    update,
    remove
};