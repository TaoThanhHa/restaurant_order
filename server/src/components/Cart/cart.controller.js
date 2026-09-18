const cartService = require("./cart.service");
const response = require("../../utils/response");

const getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.customer.id);

        return response.success(
            res,
            "Lấy giỏ hàng thành công.",
            cart
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const addItem = async (req, res) => {
    try {
        const cart = await cartService.addItem(
            req.customer.id,
            req.body
        );

        return response.success(
            res,
            "Thêm món vào giỏ thành công.",
            cart
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const removeItem = async (req, res) => {
    try {
        const cart = await cartService.removeItem(
            req.customer.id,
            Number(req.params.id)
        );

        return response.success(
            res,
            "Xóa món khỏi giỏ thành công.",
            cart
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

module.exports = {
    getCart,
    addItem,
    removeItem
};