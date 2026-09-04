import api from "../api/axiosClient";

  
// ADMIN
  

const getAll = () => {
    return api.get("/foods");
};

const getById = (id) => {
    return api.get(`/foods/${id}`);
};

const create = (data) => {
    return api.post("/foods", data);
};

const update = (id, data) => {
    return api.put(`/foods/${id}`, data);
};

const remove = (id) => {
    return api.delete(`/foods/${id}`);
};

  
// BRANCH / BRANCH
  

const getByBranch = () => {
    return api.get("/foods/branch");
};

const getByQrCode = async (qrCode) => {

    const res = await api.get(
        `/foods/qr/${qrCode}`
    );

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