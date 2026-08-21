const { verifyToken } = require("../utils/jwt");

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const mail = require("../config/mail");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Chưa đăng nhập.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ.",
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