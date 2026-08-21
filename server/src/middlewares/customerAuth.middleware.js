const { verifyCustomerToken } = require("../utils/jwtCustomer");

const customerAuthMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ."
            });
        }

        req.customer = verifyCustomerToken(token);

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ."
        });

    }

};

module.exports = customerAuthMiddleware;