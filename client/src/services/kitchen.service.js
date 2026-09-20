import api from "../api/axiosClient";

const getToken = () => {
    return localStorage.getItem("token");
};

const getConfig = () => ({
    headers: { Authorization:`Bearer ${getToken()}`,},
});

const getPending = async () => {
    const res = await api.get(`/kitchen/pending`, getConfig());
    return res.data;
};

const getPreparing = async () => {
    const res = await api.get(`/kitchen/preparing`, getConfig());
    return res.data;
};

const getCompleted = async () => {
    const res = await api.get(`/kitchen/completed`, getConfig());
    return res.data;
};

const startOrder = async (orderId) => {
    const res = await api.patch(`/kitchen/orders/${orderId}/start`, {}, getConfig());
    return res.data;
};

const completeOrder = async (orderId) => {
    const res = await api.patch(`/kitchen/orders/${orderId}/complete`, {}, getConfig());
    return res.data;
};

export default {
    getPending,
    getPreparing,
    getCompleted,
    startOrder,
    completeOrder,
};