const cartService = require("./cart.service");
const response = require("../../utils/response");

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.params.guestToken);

    return response.success(
      res,
      "Lấy giỏ hàng thành công.",
      cart
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

  
// ADD ITEM
  

const addItem = async (req, res) => {

  try {

    const cart = await cartService.addItem(req.body);

    return response.success(
      res,
      "Thêm món vào giỏ thành công.",
      cart
    );

  } catch (error) {

    return response.error(
      res,
      error.message,
      400
    );

  }

};

  
// REMOVE ITEM
  

const removeItem = async (req, res) => {

  try {

    const cart = await cartService.removeItem(
      Number(req.params.id)
    );

    return response.success(
      res,
      "Xóa món khỏi giỏ thành công.",
      cart
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
  getCart,
  addItem,
  removeItem,
};