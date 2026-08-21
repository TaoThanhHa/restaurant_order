const authService = require("./auth.service");
const response = require("../../utils/response");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response.error(
        res,
        "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.",
        400
      );
    }

    const result = await authService.login(email, password);

    return response.success(
      res,
      "Đăng nhập thành công.",
      result
    );
  } catch (error) {
    return response.error(
      res,
      error.message,
      401
    );
  }
};

const profile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);

    return response.success(
      res,
      "Lấy thông tin thành công.",
      user
    );
  } catch (error) {
    return response.error(
      res,
      error.message,
      400
    );
  }
};

const forgotPassword = async(req,res)=>{

    await authService.forgotPassword(
        req.body.email
    );

    return response.success(
        res,
        "Nếu email tồn tại, OTP đã được gửi."
    );

};

const resetPassword = async(req,res)=>{

    await authService.resetPassword(
        req.body
    );

    return response.success(
        res,
        "Đổi mật khẩu thành công."
    );

};

module.exports = {
  login,
  profile,
  forgotPassword,
  resetPassword,
};