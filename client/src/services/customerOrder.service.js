import api from "../api/axiosClient";

const create = async (data) => {
    const res = await api.post("/customer/orders", data);
    return res.data;
};

export default {
    create,
};