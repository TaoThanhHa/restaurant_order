import api from "../api/axiosClient";

const getAll = () => {
    return api.get("/categories");
};

const getById = (id) => {
    return api.get(`/categories/${id}`);
};

const create = (data) => {
    return api.post("/categories", data);
};

const update = (id, data) => {
    return api.put(`/categories/${id}`, data);
};

const remove = (id) => {
    return api.delete(`/categories/${id}`);
};

export default {
    getAll,
    getById,
    create,
    update,
    remove,
};