import api from "../api/axiosClient";

const getStatistics = async (params = {}) => {
    const res = await api.get("/statistics", { params });
    return res.data;
};

const getBranches = async () => {
    const res = await api.get("/branches");
    return res.data;
};

export default {
    getStatistics,
    getBranches,
};