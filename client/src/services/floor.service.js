import api from "../api/axiosClient";

const getAll = async () => {
    const res = await api.get("/floors");
    return res.data;
};

const getByBranch = async (branchId) => {
    const res = await api.get(`/floors/branch/${branchId}`);
    return res.data;
};

const getById = async (id) => {
    const res = await api.get(`/floors/${id}`);
    return res.data;
};

const create = async (data) => {
    const res = await api.post("/floors", data);
    return res.data;
};

const update = async (id, data) => {
    const res = await api.put(`/floors/${id}`, data);
    return res.data;
};

const remove = async (id) => {
    const res = await api.delete(`/floors/${id}`);
    return res.data;
};

export default {
    getAll,
    getByBranch,
    getById,
    create,
    update,
    remove,
};