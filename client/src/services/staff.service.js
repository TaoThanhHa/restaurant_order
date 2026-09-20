import api from "../api/axiosClient";

const getAll = async () => {
    const res = await api.get("/employee");
    return res.data;
};

const getById = async (userId) => {
    const res = await api.get(`/employee/${userId}`);
    return res.data;
};

const create = async (data) => {
    const res = await api.post("/employee", data);
    return res.data;
};

const update = async (userId, data) => {
    const res = await api.put(`/employee/${userId}`, data);
    return res.data;
};

const toggleStatus = async (userId) => {
    const res = await api.patch(`/employee/${userId}/toggle-status`);
    return res.data;
};

export default {
    getAll,
    getById,
    create,
    update,
    toggleStatus,
};