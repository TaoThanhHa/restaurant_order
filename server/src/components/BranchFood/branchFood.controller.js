const branchFoodService = require("./branchFood.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {
  try {
    const foods = await branchFoodService.getAll(req.user.branchId);

    return response.success(
      res,
      "Lấy menu thành công.",
      foods
    );
  } catch (error) {
    return response.error(res, error.message, 500);
  }
};

const updateStatus = async (req, res) => {
  try {
    const foodId = Number(req.params.foodId);

    if (isNaN(foodId)) {
      return response.error(res, "foodId không hợp lệ.", 400);
    }
    const result = await branchFoodService.updateStatus(
      req.user.branchId,
      foodId,
      req.body.status
    );

    return response.success(
      res,
      "Cập nhật trạng thái thành công.",
      result
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

module.exports = {
  getAll,
  updateStatus,
};