const paymentService = require("./payment.service");

const create = async (req, res) => {
    try {
        const result = await paymentService.createPayment(
            req.body.orderId,
            req.body,
            req.user
        );

        return res.status(201).json({
            success: true,
            message:
                result.paymentMethod === "CASH"
                    ? "Thanh toán tiền mặt thành công."
                    : "Tạo yêu cầu thanh toán thành công.",
            data: result,
        });
    } catch (error) {
        console.error("CREATE PAYMENT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const confirm = async (req, res) => {
    try {
        const result = await paymentService.confirmPayment(
            req.params.id,
            req.user
        );

        return res.json({
            success: true,
            message: "Xác nhận thanh toán thành công.",
            data: result,
        });
    } catch (error) {
        console.error("CONFIRM PAYMENT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getById = async (req, res) => {
    try {
        const result = await paymentService.getById(
            req.params.id,
            req.user
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("GET PAYMENT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deletePaymentAccount = async (id, user) => {
    const accountId = Number(id);
    const restaurantId = Number(user.restaurantId);

    if (!Number.isInteger(accountId)) {
        throw new Error("Payment account ID không hợp lệ.");
    }

    const account = await prisma.paymentAccount.findFirst({
        where: {
            id: accountId,
            restaurantId,
        },
    });

    if (!account) {
        throw new Error("Tài khoản ngân hàng không tồn tại.");
    }

    const paymentCount = await prisma.payment.count({
        where: {
            paymentAccountId: accountId,
        },
    });

    if (paymentCount > 0) {
        throw new Error(
            "Không thể xóa tài khoản đã phát sinh giao dịch. Hãy tắt tài khoản thay vì xóa."
        );
    }

    await prisma.paymentAccount.delete({
        where: {
            id: accountId,
        },
    });

    return {
        id: accountId,
    };
};

const getAccounts = async (req, res) => {
    try {
        const result = await paymentService.getPaymentAccounts(
            req.user
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("GET PAYMENT ACCOUNTS ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const createAccount = async (req, res) => {
    try {
        const result = await paymentService.createPaymentAccount(
            req.body,
            req.user
        );

        return res.status(201).json({
            success: true,
            message: "Thêm tài khoản ngân hàng thành công.",
            data: result,
        });
    } catch (error) {
        console.error("CREATE PAYMENT ACCOUNT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const updateAccount = async (req, res) => {
    try {
        const result = await paymentService.updatePaymentAccount(
            req.params.id,
            req.body,
            req.user
        );

        return res.json({
            success: true,
            message: "Cập nhật tài khoản ngân hàng thành công.",
            data: result,
        });
    } catch (error) {
        console.error("UPDATE PAYMENT ACCOUNT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const result = await paymentService.deletePaymentAccount(
            req.params.id,
            req.user
        );

        return res.json({
            success: true,
            message: "Xóa tài khoản ngân hàng thành công.",
            data: result,
        });
    } catch (error) {
        console.error("DELETE PAYMENT ACCOUNT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const toggleAccount = async (req, res) => {
    try {
        const result = await paymentService.togglePaymentAccount(
            req.params.id,
            req.body.isActive,
            req.user
        );

        return res.json({
            success: true,
            message: "Cập nhật trạng thái tài khoản thành công.",
            data: result,
        });
    } catch (error) {
        console.error("TOGGLE PAYMENT ACCOUNT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    create,
    confirm,
    getById,
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    toggleAccount,
};