import api from "../api/axiosClient";

const getByFloor = async floorId => {
    const res = await api.get(`/tables/floor/${floorId}`);
    return res.data;
};

const getById = async id => {
    const res = await api.get(`/tables/${id}`);
    return res.data;
};

const open = async (tableId, data) => {
    const res = await api.post(`/tables/${tableId}/open`, data);
    return res.data;
};

const create = async data => {
    const res = await api.post("/tables", data);
    return res.data;
};

const update = async (id, data) => {
    const res = await api.put(`/tables/${id}`, data);
    return res.data;
};

const remove = async id => {
    const res = await api.delete(`/tables/${id}`);
    return res.data;
};

const transferTable = async (tableId, targetTableId) => {
    const res = await api.put(`/tables/${tableId}/transfer`, {
        targetTableId,
    });
    return res.data;
};

const mergeTables = async (tableId, targetTableId) => {
    const res = await api.post(`/tables/${tableId}/merge`, {
        targetTableId,
    });
    return res.data;
};

export default {
    getByFloor,
    getById,
    open,
    create,
    update,
    remove,
    transferTable,
    mergeTables,
};