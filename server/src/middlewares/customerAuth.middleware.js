const prisma = require("../config/prisma");
const { verifyCustomerToken } = require("../utils/jwtCustomer");

const customerAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        let token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

        if (!token) {
            token = req.query.token || null;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập."
            });
        }

        const decoded = verifyCustomerToken(token);

        const customer = await prisma.customer.findUnique({
            where: { id: Number(decoded.id) }
        });

        if (!customer || !customer.isActive) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không tồn tại hoặc đã hết hạn."
            });
        }

        req.customer = customer;

        next();
    } catch (error) {
        console.error("CUSTOMER AUTH ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ."
        });
    }
};

module.exports = customerAuthMiddleware;