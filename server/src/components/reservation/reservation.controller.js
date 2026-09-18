const reservationService = require("./reservation.service");
const response = require("../../utils/response");

const create = async (req, res) => {
    try {
        const result = await reservationService.create(req.body, req.user);
        return response.success(res, "Tạo đặt bàn thành công.", result, 201);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await reservationService.getAll(req.user, req.query);
        return response.success(res, "Lấy danh sách đặt bàn thành công.", result);
    } catch (error) {
        const statusCode = error.message.includes("quyền") ? 403 : 400;
        return response.error(res, error.message, statusCode);
    }
};

const getById = async (req, res) => {
    try {
        const result = await reservationService.getReservation(
            Number(req.params.id),
            req.user
        );
        return response.success(res, "Lấy đặt bàn thành công.", result);
    } catch (error) {
        const statusCode = error.message.includes("quyền") ? 403 : 404;
        return response.error(res, error.message, statusCode);
    }
};

const update = async (req, res) => {
    try {
        const result = await reservationService.update(
            Number(req.params.id),
            req.body,
            req.user
        );
        return response.success(res, "Cập nhật đặt bàn thành công.", result);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const cancel = async (req, res) => {
    try {
        const result = await reservationService.cancel(
            Number(req.params.id),
            req.user
        );
        return response.success(res, "Hủy đặt bàn thành công.", result);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const getAvailableTables = async (req, res) => {
    try {
        const result = await reservationService.getAvailableTables(
            Number(req.params.id),
            req.user
        );
        return response.success(res, "Lấy danh sách bàn thành công.", result);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const assignTable = async (req, res) => {
    try {
        const result = await reservationService.assignTable(
            Number(req.params.id),
            Number(req.body.tableId),
            req.user
        );
        return response.success(res, "Gán bàn cho đặt bàn thành công.", result);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const remind = async (req, res) => {
    try {
        const result = await reservationService.remind(
            Number(req.params.id),
            req.user
        );
        return response.success(res, "Đã ghi nhận gọi nhắc khách.", result);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const checkIn = async (req, res) => {
    try {
        const result = await reservationService.checkIn(
            Number(req.params.id),
            req.user
        );
        return response.success(res, "Check-in khách thành công.", result);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const complete = async (req, res) => {
    try {
        const result = await reservationService.complete(
            Number(req.params.id),
            req.user
        );
        return response.success(res, "Hoàn thành đặt bàn.", result);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    cancel,
    getAvailableTables,
    assignTable,
    remind,
    checkIn,
    complete,
};