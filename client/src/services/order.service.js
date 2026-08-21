import api from "../api/axiosClient";

const orderService = {

    // ORDER TẠI BÀN

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

    // TAKE AWAY

    createTakeAway(data) {
        return api.post(
            "/orders/take-away",
            data
        );
    },

    getTakeAway() {
        return api.get(
            "/orders/take-away"
        );
    },

    getHistory() {
        return api.get("/orders/history");
    },

};

export default orderService;