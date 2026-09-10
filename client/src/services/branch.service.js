import api from "../api/axiosClient";

const getAll = async () => {
    const res = await api.get(`/branches`);
    return res.data;
};

const getById = async (id) => {
    const res = await api.get(`/branches/${id}`);
    return res.data;
};

const create = async (data) => {
    const res = await api.post("/branches", data);
    return res.data;
};

const update = async (id, data) => {
    const res = await api.put(`/branches/${id}`, data);
    return res.data;
};

const toggleStatus = async (id) => {
    const res = await api.patch(`/branches/${id}/status`);
    return res.data;
};

export default {
    getAll,
    getById,
    create,
    update,
    toggleStatus,
};