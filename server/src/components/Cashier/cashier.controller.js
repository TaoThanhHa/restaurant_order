const cashierService = require("./cashier.service");
const response = require("../../utils/response");

const dashboard = async (req, res) => {
    try {
        const data = await cashierService.dashboard(req.user.branchId);
        return response.success(res, "Dashboard.", data);
    } catch (error) {
        return response.error(res, error.message);
    }
};

const getTables = async (req, res) => {
    try {
        const data = await cashierService.getTables(req.user.branchId);
        return response.success(res, "Danh sách bàn.", data);
    } catch (error) {
        return response.error(res, error.message);
    }
};

const getPendingOrders = async (req, res) => {
    try {
        const data = await cashierService.getPendingOrders(req.user.branchId);
        return response.success(res, "Danh sách đơn chờ.", data);
    } catch (error) {
        return response.error(res, error.message);
    }
};

const getServingOrders = async (req, res) => {
    try {
        const data = await cashierService.getServingOrders(req.user.branchId);
        return response.success(res, "Danh sách đơn.", data);
    } catch (error) {
        return response.error(res, error.message);
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const data = await cashierService.getOrderDetail(
            req.params.id
        );

        return response.success(
            res,
            data,
            "Lấy chi tiết hóa đơn thành công."
        );
    } catch (err) {
        return response.error(
            res,
            err.message
        );
    }
};

const getOpenOrders = async (req, res) => {
    try {
        const data = await cashierService.getOpenOrders(
            req.user.branchId
        );

        return successResponse(
            res,
            data,
            "Lấy danh sách hóa đơn thành công."
        );
    } catch (err) {
        return errorResponse(
            res,
            err.message
        );
    }
};

const updateOrderItemStatus = async (req, res) => {
    try {
        const data = await cashierService.updateOrderItemStatus(
            req.user.branchId,
            req.params.id,
            req.body.status
        );

        return successResponse(
            res,
            data,
            "Cập nhật trạng thái món thành công."
        );

    } catch (err) {
        return errorResponse(
            res,
            err.message
        );
    }
};

const payment = async (req, res) => {
    try {
        const result = await cashierService.payment(
            req.params.id,
            req.body
        );

        return successResponse(
            res,
            result,
            "Thanh toán thành công."
        );

    } catch (err) {
        return errorResponse(
            res,
            err.message
        );
    }
};

const getStatistics = async (req, res) => {

    try {

        const data =
            await cashierService.getStatistics(
                req.user.branchId
            );

        return response.success(
            res,
            "Lấy thống kê thành công.",
            data
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
    dashboard,
    getTables,
    getPendingOrders,
    getServingOrders,
    getOrderDetail,
    getOpenOrders,
    updateOrderItemStatus,
    payment,
    getStatistics,
};