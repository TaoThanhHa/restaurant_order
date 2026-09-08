import api from "../api/axiosClient";

const create = async ({
    qrCode,
    message,
}) => {
    const res =await api.post("/service-requests", {qrCode, message,});
    return res.data;
};

const getAll = async () => {
    const res = await api.get("/service-requests");
    return res.data;
};

const accept = async (id) => {
    const res = await api.patch(`/service-requests/${id}/accept` );
    return res.data;
};

const complete = async (id) => {
    const res = await api.patch(`/service-requests/${id}/complete` );
    return res.data;
};

const getStatus = async (id) => {
    const res = await api.get( `/service-requests/${id}/status` );
    return res.data;
};

const getCustomerRequests = async (tableId) => {
    const res = await api.get( `/service-requests/customer`, { params: { tableId, }, });
    return res.data;
};

export default {
    create,
    getAll,
    accept,
    complete,
    getStatus,
    getCustomerRequests,
};