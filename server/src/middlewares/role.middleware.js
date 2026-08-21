const response = require("../utils/response");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return response.error(
        res,
        "Chưa đăng nhập.",
        401
      );
    }

    if (!roles.includes(req.user.role)) {
      return response.error(
        res,
        "Bạn không có quyền thực hiện chức năng này.",
        403
      );
    }

    next();
  };
};

module.exports = authorize;