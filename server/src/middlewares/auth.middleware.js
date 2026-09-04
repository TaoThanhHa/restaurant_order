const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        const token =
            authHeader?.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : req.query.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập.",
            });
        }

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token đã hết hạn hoặc không hợp lệ.",
        });
    }
};

module.exports = authMiddleware;