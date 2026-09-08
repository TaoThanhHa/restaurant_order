const kitchenService = require("./kitchen.service");

// ======================================================
// GET WAITING ORDERS
// ======================================================

const getPending = async (req, res) => {
    try {
        const branchId = req.user.branchId;

        const orders = await kitchenService.getPending(branchId);

        return res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error("GET KITCHEN PENDING ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Không thể lấy danh sách đơn đang chờ.",
        });
    }
};


// ======================================================
// GET PREPARING ORDERS
// ======================================================

const getPreparing = async (req, res) => {
    try {
        const branchId = req.user.branchId;

        const orders = await kitchenService.getPreparing(branchId);

        return res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error("GET KITCHEN PREPARING ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Không thể lấy danh sách đơn đang chế biến.",
        });
    }
};


// ======================================================
// GET COMPLETED ORDERS
// ======================================================

const getCompleted = async (req, res) => {
    try {
        const branchId = req.user.branchId;

        const orders = await kitchenService.getCompleted(branchId);

        return res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error("GET KITCHEN COMPLETED ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Không thể lấy danh sách đơn đã hoàn thành.",
        });
    }
};


// ======================================================
// START ORDER
// ======================================================

const startOrder = async (req, res) => {
    try {
        const branchId = req.user.branchId;
        const { orderId } = req.params;

        const result = await kitchenService.startOrder(
            orderId,
            branchId
        );

        return res.json({
            success: true,
            message: "Đã bắt đầu chế biến đơn hàng.",
            data: result,
        });
    } catch (error) {
        console.error("START KITCHEN ORDER ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Không thể bắt đầu chế biến đơn hàng.",
        });
    }
};


// ======================================================
// COMPLETE ORDER
// ======================================================

const completeOrder = async (req, res) => {
    try {
        const branchId = req.user.branchId;
        const { orderId } = req.params;

        const result = await kitchenService.completeOrder(
            orderId,
            branchId
        );

        return res.json({
            success: true,
            message: "Đã hoàn thành chế biến đơn hàng.",
            data: result,
        });
    } catch (error) {
        console.error("COMPLETE KITCHEN ORDER ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Không thể hoàn thành đơn hàng.",
        });
    }
};


module.exports = {
    getPending,
    getPreparing,
    getCompleted,
    startOrder,
    completeOrder,
};