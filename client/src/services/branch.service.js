import api from "../api/axiosClient";

const getAll = async () => {
    const res = await api.get("/branches");
    return res.data;
};

//Lấy id
const getById = async (id) => {
    const res = await api.get(`/branches/${id}`);
    return res.data;
};
  
// tạo mới
const create = async (data) => {
    const res = await api.post("/branches", data);
    return res.data;
};
  
// cập nhật  
const update = async (id, data) => {
    const res = await api.put(`/branches/${id}`, data);
    return res.data;
};

// Đổi trạng thái mở/khóa  
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