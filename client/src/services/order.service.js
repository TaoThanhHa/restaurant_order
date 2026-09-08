import api from "../api/axiosClient";

const orderService = {

    create(data) {
        return api.post("/orders", data);
    },

    getById(id) {
        return api.get(`/orders/${id}`);
    },

    addItem(orderId, data) {
        return api.post(
            `/orders/${orderId}/items`,
            data
        );
    },

    confirmItems(orderId) {
        return api.patch(
            `/orders/${orderId}/confirm`
        );
    },

    updateItem(itemId, data) {
        return api.put(
            `/orders/items/${itemId}`,
            data
        );
    },

    removeItem(orderId, itemId) {
        return api.delete(
            `/orders/${orderId}/items/${itemId}`
        );
    },

    closeOrder(orderId, status) {
        return api.put(
            `/orders/${orderId}/status`,
            { status }
        );
    },

    payment(orderId, data) {
        return api.post(
            `/orders/${orderId}/payment`,
            data
        );
    },

    mergeOrders({
        targetOrderId,
        sourceOrderIds
    }) {
        return api.post(
            "/orders/merge",
            {
                targetOrderId,
                sourceOrderIds
            }
        );
    },


    getPendingOrders() {
        return api.get("/orders/pending");
    },
    getCompletedKitchenOrders: () => {
        return api.get("/orders/completed-kitchen");
    },

    createTakeAway(data) {
        return api.post(
            "/orders/take-away",
            data
        );
    },

    getTakeAway(branchId) {
        return api.get(`/orders/take-away`, {
            params: {
                branchId,
            },
        });
    },

    getHistory() {
        return api.get(
            "/orders/history"
        );
    },

};

export default orderService;