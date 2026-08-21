const guestOrderService = require("./guest.order.service");
const response = require("../../utils/response");

  
// GET ORDER
  

const getById = async (req, res) => {
  try {
    const order = await guestOrderService.getById(
      Number(req.params.id),
      req.customer
    );

    return response.success(
      res,
      "Lấy đơn hàng thành công.",
      order
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

  
// ADD ITEM
  

const addItem = async (req, res) => {
  try {
    const item = await guestOrderService.addItem(
      Number(req.params.orderId),
      req.body,
      req.customer
    );

    return response.success(
      res,
      "Thêm món thành công.",
      item
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

  
// UPDATE ITEM
  

const updateItem = async (req, res) => {
  try {
    const item = await guestOrderService.updateItem(
      Number(req.params.itemId),
      req.body,
      req.customer
    );

    return response.success(
      res,
      "Cập nhật món thành công.",
      item
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

  
// REMOVE ITEM
  

const removeItem = async (req, res) => {
  try {
    await guestOrderService.removeItem(
      Number(req.params.itemId),
      req.customer
    );

    return response.success(
      res,
      "Hủy món thành công."
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

module.exports = {
  getById,
  addItem,
  updateItem,
  removeItem,
};