import api from "../api/axiosClient";

const getStatistics = async () => {

    const res =
        await api.get("/cashier/statistics");

    return res.data;

};

export default {
    getStatistics,
};