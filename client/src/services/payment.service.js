import api from "../api/axiosClient";

const createPayment = async data => {
    const res = await api.post("/payments", data);
    return res.data;
};

const getPaymentById = async id => {
    const res = await api.get(`/payments/${id}`);
    return res.data;
};

const confirmPayment = async id => {
    const res = await api.post(`/payments/${id}/confirm`);
    return res.data;
};

const getAll = async () => {
    const res = await api.get("/payments/accounts");
    return res.data;
};

const createAccount = async data => {
    const res = await api.post("/payments/accounts", data);
    return res.data;
};

const updateAccount = async (id, data) => {
    const res = await api.put(`/payments/accounts/${id}`, data);
    return res.data;
};

const removeAccount = async id => {
    const res = await api.delete(`/payments/accounts/${id}`);
    return res.data;
};

const toggleAccount = async (id, isActive) => {
    const res = await api.patch(`/payments/accounts/${id}/status`, {
        isActive,
    });
    return res.data;
};

export default {
    createPayment,
    getPaymentById,
    confirmPayment,
    getAll,
    createAccount,
    updateAccount,
    removeAccount,
    toggleAccount,
};