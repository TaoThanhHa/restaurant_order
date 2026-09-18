import api from "../api/axiosClient";

const getAll = async branchId => {
    const query = branchId ? `?branchId=${branchId}` : "";
    const res = await api.get(`/employee${query}`);
    return res.data;
};

const getById = async (userId, branchId) => {
    const query = branchId ? `?branchId=${branchId}` : "";
    const res = await api.get(`/employee/${userId}${query}`);
    return res.data;
};

const create = async (data, branchId) => {
    const query = branchId ? `?branchId=${branchId}` : "";
    const res = await api.post(`/employee${query}`, data);
    return res.data;
};

const update = async (userId, data, branchId) => {
    const query = branchId ? `?branchId=${branchId}` : "";
    const res = await api.put(`/employee/${userId}${query}`, data);
    return res.data;
};

const toggleStatus = async (userId, branchId) => {
    const query = branchId ? `?branchId=${branchId}` : "";
    const res = await api.patch(
        `/employee/${userId}/toggle-status${query}`
    );
    return res.data;
};

export default {
    getAll,
    getById,
    create,
    update,
    toggleStatus,
};
