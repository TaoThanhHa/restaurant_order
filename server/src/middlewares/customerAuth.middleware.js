const { verifyCustomerToken } = require("../utils/jwtCustomer");

const customerAuthMiddleware = (req, res, next) => {

    try {
        const authHeader =
            req.headers.authorization;

        let token =
            authHeader?.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null;


        // SSE không gửi được Authorization header
        if (!token) {

            token =
                req.query.token ||
                null;

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