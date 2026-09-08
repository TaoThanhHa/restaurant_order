import api from "../api/axiosClient";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => {
    return localStorage.getItem("token");
};

const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});

const kitchenService = {

    // ======================================================
    // HÀNG CHỜ
    // ======================================================

    async getPending() {

        const response = await api.get(
            `${API_URL}/kitchen/pending`,
            getConfig()
        );

        return response.data;
    },


    // ======================================================
    // ĐANG CHẾ BIẾN
    // ======================================================

    async getPreparing() {

        const response = await api.get(
            `${API_URL}/kitchen/preparing`,
            getConfig()
        );

        return response.data;
    },


    // ======================================================
    // HOÀN THÀNH
    // ======================================================

    async getCompleted() {

        const response = await api.get(
            `${API_URL}/kitchen/completed`,
            getConfig()
        );

        return response.data;
    },


    // ======================================================
    // BẮT ĐẦU CHẾ BIẾN CẢ ĐƠN
    // ======================================================

    async startOrder(orderId) {

        const response = await api.patch(
            `${API_URL}/kitchen/orders/${orderId}/start`,
            {},
            getConfig()
        );

        return response.data;
    },


    // ======================================================
    // HOÀN THÀNH CẢ ĐƠN
    // ======================================================

    async completeOrder(orderId) {

        const response = await api.patch(
            `${API_URL}/kitchen/orders/${orderId}/complete`,
            {},
            getConfig()
        );

        return response.data;
    },

};

export default kitchenService;