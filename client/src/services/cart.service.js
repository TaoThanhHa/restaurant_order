import api from "../api/axiosClient";

const get = async guestToken => {
    const res = await api.get(`/customer/cart/${guestToken}`);
    return res.data;
};

const addItem = async data => {
    const res = await api.post("/customer/cart/items", data);
    return res.data;
};

const updateItem = async (id, data) => {
    const res = await api.put(`/customer/cart/${id}`, data);
    return res.data;
};

const removeItem = async (id, guestToken) => {
    const res = await api.delete(`/customer/cart/items/${id}`, {
        data: { guestToken }
    });

    return res.data;
};

export default {
    get,
    addItem,
    updateItem,
    removeItem,
};