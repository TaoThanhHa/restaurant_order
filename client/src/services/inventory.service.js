import api from "../api/axiosClient";

const inventoryService = {
    // ========================================
    // INGREDIENTS
    // ========================================

    getAllIngredients: async (branchId) => {
        const response = await api.get(
            "/inventory/ingredients",
            {
                params: { branchId },
            }
        );

        return response.data;
    },

    getIngredientById: async (id) => {
        const response = await api.get(
            `/inventory/ingredients/${id}`
        );

        return response.data;
    },

    createIngredient: async (data) => {
        const response = await api.post(
            "/inventory/ingredients",
            data
        );

        return response.data;
    },

    updateIngredient: async (id, data) => {
        const response = await api.put(
            `/inventory/ingredients/${id}`,
            data
        );

        return response.data;
    },

    toggleIngredientStatus: async (id) => {
        const response = await api.patch(
            `/inventory/ingredients/${id}/toggle-status`
        );

        return response.data;
    },

    // ========================================
    // INVENTORY
    // ========================================

    getStock: async (branchId) => {
        const response = await api.get(
            "/inventory/stock",
            {
                params: { branchId },
            }
        );

        return response.data;
    },

    importInventory: async (data) => {
        const response = await api.post(
            "/inventory/import",
            data
        );

        return response.data;
    },

    exportInventory: async (data) => {
        const response = await api.post(
            "/inventory/export",
            data
        );

        return response.data;
    },

    adjustInventory: async (data) => {
        const response = await api.post(
            "/inventory/adjust",
            data
        );

        return response.data;
    },

    // ========================================
    // HISTORY
    // ========================================

    getTransactions: async (
        branchId,
        ingredientId = null
    ) => {
        const params = {
            branchId,
        };

        if (ingredientId) {
            params.ingredientId = ingredientId;
        }

        const response = await api.get(
            "/inventory/transactions",
            { params }
        );

        return response.data;
    },
};

export default inventoryService;
