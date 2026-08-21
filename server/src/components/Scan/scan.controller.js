const scanService = require("./scan.service");
const response = require("../../utils/response");

const scan = async (req, res) => {
  try {

    const result = await scanService.scan(req.params.qrCode);

    return response.success(
      res,
      "Quét QR thành công.",
      result
    );

  } catch (error) {

    return response.error(
      res,
      error.message,
      400
    );

  }
};

module.exports = {
  scan,
};