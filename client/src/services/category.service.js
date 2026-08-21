import api from "../api/axiosClient";

  
// GET ALL
  

const getAll = () => {
    return api.get("/categories");
};

  
// GET BY ID
  

const getById = (id) => {
    return api.get(`/categories/${id}`);
};

  
// CREATE
  

const create = (data) => {
    return api.post("/categories", data);
};

  
// UPDATE
  

const update = (id, data) => {
    return api.put(`/categories/${id}`, data);
};

  
// DELETE
  

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