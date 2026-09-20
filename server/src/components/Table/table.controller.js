const tableService = require("./table.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {
    try {
        const tables =
            await tableService.getAll(
                req.user
            );

        return response.success(
            res,
            "Lấy danh sách bàn thành công.",
            tables
        );
    } catch (error) {
        return response.error(
            res,
            error.message,
            500
        );
    }
};

const getById = async (
    req,
    res
) => {
    try {
        const table =
            await tableService.getById(
                Number(req.params.id),
                req.user
            );

        return response.success(
            res,
            "Lấy bàn thành công.",
            table
        );
    } catch (error) {
        const statusCode =
            error.message.includes(
                "quyền"
            )
                ? 403
                : 404;

        return response.error(
            res,
            error.message,
            statusCode
        );
    }
};
const getByFloor = async (req, res) => {
    try {
        const data = await tableService.getByFloor(
            Number(req.params.floorId),
            req.user
        );

        return response.success(
            res,
            "Lấy danh sách bàn thành công.",
            data
        );
    } catch (error) {
        const statusCode =
            error.message.includes("quyền")
                ? 403
                : 400;

        return response.error(
            res,
            error.message,
            statusCode
        );
    }
};
const create = async (
    req,
    res
) => {
    try {
        const table =
            await tableService.create(
                req.body,
                req.user
            );

        return response.success(
            res,
            "Thêm bàn thành công.",
            table,
            201
        );
    } catch (error) {
        const statusCode =
            error.message.includes(
                "quyền"
            )
                ? 403
                : 400;

        return response.error(
            res,
            error.message,
            statusCode
        );
    }
};

const update = async (
    req,
    res
) => {
    try {
        const table =
            await tableService.update(
                Number(req.params.id),
                req.body,
                req.user
            );

        return response.success(
            res,
            "Cập nhật bàn thành công.",
            table
        );
    } catch (error) {
        const statusCode =
            error.message.includes(
                "quyền"
            )
                ? 403
                : 400;

        return response.error(
            res,
            error.message,
            statusCode
        );
    }
};

const remove = async (
    req,
    res
) => {
    try {
        await tableService.remove(
            Number(req.params.id),
            req.user
        );

        return response.success(
            res,
            "Xóa bàn thành công."
        );
    } catch (error) {
        const statusCode =
            error.message.includes(
                "quyền"
            )
                ? 403
                : 400;

        return response.error(
            res,
            error.message,
            statusCode
        );
    }
};

const scanQr = async (
    req,
    res
) => {
    try {
        const result =
            await tableService.scanQr(
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

const open = async (
    req,
    res
) => {
    try {
        const result =
            await tableService.open(
                Number(req.params.id),
                req.body
            );

        return response.success(
            res,
            "Mở bàn thành công.",
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

const transferTable = async (req, res) => {
    try {
        const result = await tableService.transferTable(
            Number(req.params.id),
            Number(req.body.targetTableId),
            req.user
        );

        return response.success(
            res,
            "Đổi bàn thành công.",
            result
        );
    } catch (error) {
        const statusCode = error.message.includes("quyền") ? 403 : 400;
        return response.error(res, error.message, statusCode);
    }
};

const mergeTables = async (req, res) => {
    try {
        const result = await tableService.mergeTables(
            Number(req.params.id),
            Number(req.body.targetTableId),
            req.user
        );

        return response.success(
            res,
            "Gộp bàn thành công.",
            result
        );
    } catch (error) {
        const statusCode = error.message.includes("quyền") ? 403 : 400;
        return response.error(res, error.message, statusCode);
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
    open,
    transferTable,
    mergeTables,
};