const tableService = require("./table.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {
  try {
    const tables = await tableService.getAll();

    return response.success(
      res,
      "Lấy danh sách bàn thành công.",
      tables
    );
  } catch (error) {
    return response.error(res, error.message, 500);
  }
};

const getById = async (req, res) => {
  try {
    const table = await tableService.getById(
      Number(req.params.id)
    );

    return response.success(
      res,
      "Lấy bàn thành công.",
      table
    );
  } catch (error) {
    return response.error(res, error.message, 404);
  }
};

const getByFloor = async (req, res) => {
  try {
    const tables = await tableService.getByFloor(
      req.user.branchId,
      Number(req.params.floorId)
    );

    return response.success(
      res,
      "Lấy danh sách bàn thành công.",
      tables
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const create = async (req, res) => {
  try {
    const table = await tableService.create(req.body);

    return response.success(
      res,
      "Thêm bàn thành công.",
      table,
      201
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const update = async (req, res) => {
  try {
    const table = await tableService.update(
      Number(req.params.id),
      req.body
    );

    return response.success(
      res,
      "Cập nhật bàn thành công.",
      table
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const remove = async (req, res) => {
  try {
    await tableService.remove(
      Number(req.params.id)
    );

    return response.success(
      res,
      "Xóa bàn thành công."
    );
  } catch (error) {
    return response.error(res, error.message, 400);
  }
};

const scanQr = async (req, res) => {
  try {
    const result = await tableService.scanQr(
      req.params.qrCode
    );

    return response.success(
      res,
      "Quét QR thành công.",
      result
    );
  } catch (error) {
    return response.error(
      res,
      error.message,
      404
    );
  }
};

const open = async (req, res) => {
    try {
        const result = await tableService.open(
            Number(req.params.id),
            req.body
        );

        return response.success(
            res,
            "Mở bàn thành công.",
            result
        );
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

module.exports = {
  getAll,
  getByFloor,
  getById,
  create,
  update,
  remove,
  scanQr,
  open
};