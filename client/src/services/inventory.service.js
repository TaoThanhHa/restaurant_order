import api from "../api/axiosClient";

const getIngredientById = async (id) => {
    const res = await api.get(`/inventory/ingredients/${id}`);
    return res.data;
};

const createIngredient = async (data) => {
    const res = await api.post("/inventory/ingredients", data);
    return res.data;
};

const updateIngredient = async (id, data) => {
    const res = await api.put(`/inventory/ingredients/${id}`, data);
    return res.data;
};

const toggleIngredientStatus = async (id) => {
    const res = await api.patch(`/inventory/ingredients/${id}/toggle-status`);
    return res.data;
};

const getStock = async (branchId) => {
    const res = await api.get("/inventory/stock", { params: { branchId },});
    return res.data;
};

const importInventory = async (data) => {
    const res = await api.post("/inventory/import", data);
    return res.data;
};

const exportInventory = async (data) => {
    const res = await api.post("/inventory/export", data);
    return res.data;
};

const adjustInventory = async (data) => {
    const res = await api.post("/inventory/adjust", data);
    return res.data;
};

const getTransactions = async (branchId, ingredientId = null) => {
    const params = { branchId,};
    if (ingredientId) { params.ingredientId = ingredientId;}
    const res = await api.get("/inventory/transactions", { params,});
    return res.data;
};

export default {
    getIngredientById,
    createIngredient,
    updateIngredient,
    toggleIngredientStatus,
    getStock,
    importInventory,
    exportInventory,
    adjustInventory,
    getTransactions,
};