import api from "../api/axiosClient";

const getAll = async params => {
    const res = await api.get("/reservations", { params });
    return res.data;
};

const getById = async id => {
    const res = await api.get(`/reservations/${id}`);
    return res.data;
};

const create = async data => {
    const res = await api.post("/reservations", data);
    return res.data;
};

const update = async (id, data) => {
    const res = await api.put(`/reservations/${id}`, data);
    return res.data;
};

const cancel = async id => {
    const res = await api.delete(`/reservations/${id}`);
    return res.data;
};

const getAvailableTables = async id => {
    const res = await api.get(`/reservations/${id}/available-tables`);
    return res.data;
};

const assignTable = async (id, tableId) => {
    const res = await api.post(`/reservations/${id}/assign-table`, {
        tableId,
    });
    return res.data;
};

const remind = async id => {
    const res = await api.post(`/reservations/${id}/remind`);
    return res.data;
};

const checkIn = async id => {
    const res = await api.post(`/reservations/${id}/check-in`);
    return res.data;
};

const complete = async id => {
    const res = await api.post(`/reservations/${id}/complete`);
    return res.data;
};

export default {
    getAll,
    getById,
    create,
    update,
    cancel,
    getAvailableTables,
    assignTable,
    remind,
    checkIn,
    complete,
};