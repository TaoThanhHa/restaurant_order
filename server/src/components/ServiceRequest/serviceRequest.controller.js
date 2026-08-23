const service = require("./serviceRequest.service");

// ========================================
// KHÁCH GỬI YÊU CẦU
// ========================================
const create = async (req, res) => {
    try {
        const customerId =
            req.customer?.id ||
            req.user?.id ||
            null;

        const request =
            await service.create({
                qrCode: req.body.qrCode,
                customerId,
                message: req.body.message,
            });

        res.status(201).json({
            success: true,
            message: "Gửi yêu cầu thành công.",
            data: request,
        });

    } catch (error) {
        console.error(
            "CREATE SERVICE REQUEST ERROR:",
            error
        );

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// ========================================
// CASHIER LẤY DANH SÁCH
// ========================================

const getAll = async (req, res) => {

    try {

        const requests =
            await service.getAll(
                req.user.branchId
            );

        res.json({

            success: true,

            data: requests,

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message,

        });

    }

};


// ========================================
// XÁC NHẬN
// ========================================

const accept = async (req, res) => {

    try {

        const request =
            await service.accept({

                id:
                    Number(req.params.id),

                userId:
                    req.user.id,

                branchId:
                    req.user.branchId,

            });

        res.json({

            success: true,

            message:
                "Đã xác nhận yêu cầu.",

            data: request,

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message,

        });

    }

};


// ========================================
// HOÀN THÀNH
// ========================================

const complete = async (req, res) => {

    try {

        const request =
            await service.complete({

                id:
                    Number(req.params.id),

                branchId:
                    req.user.branchId,

            });

        res.json({

            success: true,

            message:
                "Đã hoàn thành yêu cầu.",

            data: request,

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message,

        });

    }

};


// ========================================
// LẤY TRẠNG THÁI YÊU CẦU
// ========================================

const getStatus = async (req, res) => {

    try {

        const request =
            await service.getStatus(
                Number(req.params.id)
            );

        res.json({

            success: true,

            data: request,

        });

    } catch (error) {

        res.status(404).json({

            success: false,

            message:
                error.message,

        });

    }

};


// ========================================
// KHÁCH XEM YÊU CẦU
// ========================================

const getCustomerRequests = async (req, res) => {
    try {
        const customerId =
            req.customer?.id ||
            req.user?.id;

        const tableId = Number(
            req.query.tableId
        );

        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: "Không xác định được khách hàng.",
            });
        }

        if (!tableId || Number.isNaN(tableId)) {
            return res.status(400).json({
                success: false,
                message: "Không xác định được bàn.",
            });
        }

        const requests =
            await service.getCustomerRequests({
                customerId,
                tableId,
            });

        res.json({
            success: true,
            data: requests,
        });

    } catch (error) {
        console.error(
            "GET CUSTOMER SERVICE REQUEST ERROR:",
            error
        );

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


module.exports = {
    create,
    getAll,
    accept,
    complete,
    getStatus,
    getCustomerRequests,
};