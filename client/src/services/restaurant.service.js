import api from "../api/axiosClient";

const getInfo = async () => {

    const res =
        await api.get("/restaurant");

    return res.data;
};

export default {
    getInfo,
};