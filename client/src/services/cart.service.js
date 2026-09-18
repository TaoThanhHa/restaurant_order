import api from "../api/axiosClient";

const getCart = async () => {
    const res = await api.get("/cart");
    return res.data;
};

const addItem = async data => {
    const res = await api.post("/cart/items", data);
    return res.data;
};

const removeItem = async id => {
    const res = await api.delete(`/cart/items/${id}`);
    return res.data;
};

export default {
    getCart,
    addItem,
    removeItem
};