const orderService = require("./order.service");
const response = require("../../utils/response");

const getActiveOrderByTable = async (req, res) => {
    try {
        const { tableId } = req.params;

        const data = await orderService.getActiveOrderByTable(tableId);

        return response.success(
            res,
            "Kiểm tra đơn đang hoạt động thành công.",
            data
        );
    } catch (error) {
        console.error("GET ACTIVE ORDER ERROR:", error);
        return response.error(res, error.message, 400);
    }
};

const getById = async (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId)) {
            return response.error(res, "Order ID không hợp lệ.", 400);
        }

        const data = await orderService.getById(
            orderId,
            req.user
        );

        return response.success(
            res,
            "Lấy chi tiết đơn hàng thành công.",
            data
        );
    } catch (error) {
        console.error("GET ORDER ERROR:", error);
        return response.error(res, error.message, 404);
    }
};

const addItem = async (req, res) => {
    try {
        const item = await orderService.addItem(
            Number(req.params.orderId),
            req.body,
            req.user
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

const removeItem = async (req, res) => {
    try {
        const data = await orderService.removeItem(
            req.params.itemId,
            req.user
        );

        return response.success(
            res,
            "Xóa món thành công.",
            data
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const create = async (req, res) => {
    try {
        const order = await orderService.create(
            req.body,
            req.user
        );

        return response.success(
            res,
            "Tạo đơn hàng thành công.",
            order
        );
    } catch (error) {
        return response.error(
            res,
            error.message
        );
    }
};

const confirmItems = async (req, res) => {
    try {
        const data =
            await orderService.confirmItems(
                req.params.id,
                req.user
            );

        return response.success(
            res,
            "Xác nhận món thành công.",
            data
        );
    } catch (error) {
        return response.error(
            res,
            error.message
        );
    }
};

const updateItem = async (req, res) => {
    try {
        const item =
            await orderService.updateItem(
                Number(req.params.itemId),
                req.body,
                req.user
            );

        return response.success(
            res,
            "Cập nhật món thành công.",
            item
        );
    } catch (error) {
        return response.error(
            res,
            error.message
        );
    }
};

const updateStatus = async (req, res) => {
    try {
        const order =
            await orderService.updateStatus(
                Number(req.params.id),
                req.body.status,
                req.user
            );

        return response.success(
            res,
            req.body.status === "CANCELLED"
                ? "Hủy đơn hàng thành công."
                : "Cập nhật trạng thái đơn hàng thành công.",
            order
        );
    } catch (error) {
        return response.error(
            res,
            error.message
        );
    }
};

const payment = async (req, res) => {
    try {
        const result =
            await orderService.payment(
                Number(req.params.id),
                req.body,
                req.user
            );

        return response.success(
            res,
            "Thanh toán thành công.",
            result
        );
    } catch (error) {
        return response.error(
            res,
            error.message
        );
    }
};

const mergeOrders = async (req, res) => {
    try {
        const {
            targetOrderId,
            sourceOrderIds,
        } = req.body;

        const data =
            await orderService.mergeOrders({
                targetOrderId,
                sourceOrderIds,
                user: req.user,
            });

        return response.success(
            res,
            "Gộp đơn thành công.",
            data
        );
    } catch (error) {
        return response.error(
            res,
            error.message
        );
    }
};

const createTakeAway = async (req, res) => {
    try {
        const order = await orderService.createTakeAway(
            req.body,
            req.user
        );

        return response.success(
            res,
            "Tạo order mang về thành công.",
            order,
            201
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const getTakeAway = async (req, res) => {
    try {
        const orders = await orderService.getTakeAway(
            req.user,
            req.query.branchId
        );

        res.json(orders);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

const getHistory = async (req, res) => {
    try {
        const data = await orderService.getHistory(
            req.user
        );

        return response.success(
            res,
            "Lấy lịch sử đơn hàng thành công.",
            data
        );
    } catch (error) {
        console.error(
            "GET HISTORY ERROR:",
            error
        );

        return response.error(
            res,
            error.message,
            400
        );
    }
};

const getPendingOrders = async (req, res) => {
    try {
        const data = await orderService.getPendingOrders(
            req.user
        );

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("GET PENDING ORDERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Không thể lấy đơn chờ.",
        });
    }
};

const getCompletedKitchenOrders = async (req, res) => {
    try {
        const data =
            await orderService.getCompletedKitchenOrders(
                req.user
            );

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "GET COMPLETED KITCHEN ORDERS ERROR:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message,
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
    getCompletedKitchenOrders,
};