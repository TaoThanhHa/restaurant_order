import api from "../api/axiosClient";

// ========================================
// KHÁCH GỬI YÊU CẦU
// ========================================

const create = async ({
    qrCode,
    message,
}) => {

    const res =
        await api.post(
            "/service-requests",
            {
                qrCode,
                message,
            }
        );

    return res.data;
};


// ========================================
// BRANCH LẤY YÊU CẦU
// ========================================

const getAll = async () => {

    const res =
        await api.get(
            "/service-requests"
        );

    return res.data;
};


// ========================================
// XÁC NHẬN
// ========================================

const accept = async (id) => {

    const res =
        await api.patch(
            `/service-requests/${id}/accept`
        );

    return res.data;
};


// ========================================
// HOÀN THÀNH
// ========================================

const complete = async (id) => {

    const res =
        await api.patch(
            `/service-requests/${id}/complete`
        );

    return res.data;
};


// ========================================
// LẤY TRẠNG THÁI
// ========================================

const getStatus = async (id) => {

    const res =
        await api.get(
            `/service-requests/${id}/status`
        );

    return res.data;
};


// ========================================
// KHÁCH XEM YÊU CẦU
// ========================================

const getCustomerRequests = async (tableId) => {

    const res = await api.get(
        `/service-requests/customer`,
        {
            params: {
                tableId,
            },
        }
    );

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