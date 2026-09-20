const prisma = require("../config/prisma");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["guest-token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Guest Token không hợp lệ.",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        guestToken: token,
      },
      include: {
        orderMembers: true,
        cart: true,
      },
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Guest Token không hợp lệ.",
      });
    }

    req.customer = customer;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Guest Token không hợp lệ.",
    });
  }
};