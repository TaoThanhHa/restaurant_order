import api from "../api/axiosClient";

const create = async (data) => {
    const res = await api.post("/orders", data);
    return res.data;
};

const getById = async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
};

const addItem = async (orderId, data) => {
    const res = await api.post(`/orders/${orderId}/items`, data);
    return res.data;
};

const confirmItems = async (orderId) => {
    const res = await api.patch(`/orders/${orderId}/confirm`);
    return res.data;
};

const updateItem = async (itemId, data) => {
    const res = await api.put(`/orders/items/${itemId}`, data);
    return res.data;
};

const removeItem = async (orderId, itemId) => {
    const res = await api.delete(`/orders/${orderId}/items/${itemId}`);
    return res.data;
};

const closeOrder = async (orderId, status) => {
    const res = await api.put(`/orders/${orderId}/status`, { status });
    return res.data;
};

const payment = async (orderId, data) => {
    const res = await api.post(`/orders/${orderId}/payment`, data);
    return res.data;
};

const mergeOrders = async ({targetOrderId, sourceOrderIds}) => {
    const res = await api.post("/orders/merge", { targetOrderId, sourceOrderIds, });
    return res.data;
};

const getPendingOrders = async () => {
    const res = await api.get("/orders/pending");
    return res.data;
};

const getCompletedKitchenOrders = async () => {
    const res = await api.get("/orders/completed-kitchen");
    return res.data;
};

const createTakeAway = async (data) => {
    const res = await api.post("/orders/take-away", data);
    return res.data;
};

const getTakeAway = async (branchId) => {
    const res = await api.get("/orders/take-away", {params: { branchId, }, });
    return res.data;
};

const getHistory = async () => {
    const res = await api.get("/orders/history");
    return res.data;
};

export default {
    create,
    getById,
    addItem,
    confirmItems,
    updateItem,
    removeItem,
    closeOrder,
    payment,
    mergeOrders,
    getPendingOrders,
    getCompletedKitchenOrders,
    createTakeAway,
    getTakeAway,
    getHistory,
};