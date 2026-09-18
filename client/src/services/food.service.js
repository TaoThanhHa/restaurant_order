import api from "../api/axiosClient";

const getAll = async () => {
    const res = await api.get("/foods");
    return res.data;
};

const getById = async id => {
    const res = await api.get(`/foods/${id}`);
    return res.data;
};

const create = async data => {
    const res = await api.post("/foods", data);
    return res.data;
};

const update = async (id, data) => {
    const res = await api.put(`/foods/${id}`, data);
    return res.data;
};

const remove = async id => {
    const res = await api.delete(`/foods/${id}`);
    return res.data;
};

const getByBranch = async () => {
    const res = await api.get("/foods/branch");
    return res.data;
};

const getByQrCode = async qrCode => {
    const res = await api.get(`/foods/qr/${qrCode}`);
    return res.data;
};

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    getByBranch,
    getByQrCode,
};
