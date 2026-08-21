import axiosClient from "../api/axiosClient";

const getAll = async () => {
    const res = await axiosClient.get("/floors");
    return res.data;
};

const getByBranch = async (branchId) => {
    const res = await axiosClient.get(`/floors/branch/${branchId}`);
    return res.data;
};

const getById = async (id) => {
    const res = await axiosClient.get(`/floors/${id}`);
    return res.data;
};

const create = async (data) => {
    const res = await axiosClient.post("/floors", data);
    return res.data;
};

const update = async (id, data) => {
    const res = await axiosClient.put(`/floors/${id}`, data);
    return res.data;
};

const remove = async (id) => {
    const res = await axiosClient.delete(`/floors/${id}`);
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