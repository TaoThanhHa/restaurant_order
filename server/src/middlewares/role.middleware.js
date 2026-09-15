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

    let userRoles = [req.user.role];

    if (
      req.user.role === "ADMIN" &&
      req.user.restaurantMode === "SINGLE"
    ) {
      userRoles.push("BRANCH");
    }

    if (!roles.some((role) => userRoles.includes(role))) {
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
