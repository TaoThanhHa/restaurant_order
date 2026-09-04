const orderService = require("./order.service");
const response = require("../../utils/response");

  
// CREATE ORDER
  

const create = async (req, res) => {
    try {
        const order = await orderService.create({
            ...req.body,
            userId: req.user.id,
        });

        return response.success(
            res,
            "Tạo đơn hàng thành công.",
            order,
            201
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

  // CHECK ACTIVE ORDER BY TABLE
const getActiveOrderByTable = async (req, res) => {
    try {
        const { tableId } = req.params;

        const data = await orderService.getActiveOrderByTable(
            tableId
        );

        return response.success(
            res,
            "Kiểm tra đơn đang hoạt động thành công.",
            data
        );

    } catch (error) {
        console.error("GET ACTIVE ORDER ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// GET ORDER DETAIL
const getById = async (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId)) {
            return response.error(
                res,
                "Order ID không hợp lệ.",
                400
            );
        }

        const data = await orderService.getById(orderId);

        return response.success(
            res,
            "Lấy chi tiết đơn hàng thành công.",
            data
        );

    } catch (error) {
        console.error("GET ORDER ERROR:", error);

        return response.error(
            res,
            error.message,
            404
        );
    }
};
  
// ADD ITEM
  

const addItem = async (req, res) => {
  try {
    const item = await orderService.addItem(
      Number(req.params.orderId),
      req.body
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

const confirmItems = async (req, res) => {

    try {

        const data = await orderService.confirmItems(
            req.params.id
        );

        return response.success(
            res,
            data,
            "Xác nhận món thành công."
        );

    } catch (error) {

        return response.error(
            res,
            error.message,
            400
        );

    }

};

  
// UPDATE ITEM
  

const updateItem = async (req, res) => {
  try {
    const item = await orderService.updateItem(
      Number(req.params.itemId),
      req.body
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

        const { itemId } = req.params;

        const data = await orderService.removeItem(
            itemId
        );

        return response.success(
            res,
            data,
            "Xóa món thành công."
        );

    } catch (error) {

        return response.error(
            res,
            error.message,
            400
        );

    }
};

// UPDATE STATUS
  

const updateStatus = async (req, res) => {
  try {
    const order = await orderService.updateStatus(
      Number(req.params.id),
      req.body.status
    );

    return response.success(
      res,
      "Cập nhật trạng thái thành công.",
      order
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

  
// PAYMENT
  

const payment = async (req, res) => {
  try {
    const result = await orderService.payment(
      Number(req.params.id),
      req.body
    );

    return response.success(
      res,
      "Thanh toán thành công.",
      result
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

  
// CREATE TAKE AWAY ORDER
  

const createTakeAway = async (req, res) => {
    try {
        const order = await orderService.createTakeAway(
            req.user.branchId,
            req.body,
            req.user.id
        );
        return response.success(
            res,
            "Tạo order mang về thành công.",
            order,
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

const getTakeAway = async(req,res)=>{

    try{

        const data = await orderService.getTakeAway(
            req.user.branchId
        );

        return response.success(
            res,
            "Lấy danh sách thành công.",
            data
        );

    }catch(err){

        return response.error(
            res,
            err.message,
            400
        );

    }

};

  
// ORDER HISTORY
  

const getHistory = async (req, res) => {

    try {

        const data = await orderService.getHistory(
            req.user.branchId
        );

        return response.success(
            res,
            "Lấy lịch sử đơn hàng thành công.",
            data
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            400
        );

    }

};

const mergeOrders = async (req, res) => {

    try {

        const {
            targetOrderId,
            sourceOrderIds
        } = req.body;

        const data = await orderService.mergeOrders({
            targetOrderId,
            sourceOrderIds
        });

        return response.success(
            res,
            data,
            "Gộp đơn thành công"
        );

    } catch (error) {

        return response.error(
            res,
            error.message,
            400
        );

    }

};

const getPendingOrders = async (req, res) => {
    try {

        const data =
            await orderService.getPendingOrders(
                req.user.branchId
            );

        return res.json({
            success: true,
            data
        });

    } catch (error) {

        console.error(
            "GET PENDING ORDERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy đơn chờ."
        });

    }
};

module.exports = {
  create,
  getById,
  getActiveOrderByTable,
  addItem,
  confirmItems,
  updateItem,
  removeItem,
  updateStatus,
  payment,
  createTakeAway,
  getTakeAway,
  getHistory,
  mergeOrders,
  getPendingOrders,
};