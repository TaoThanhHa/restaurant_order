import api from "../api/axiosClient";

const getProfile = async () => {
    const res = await api.get("/branches/profile");
    return res.data;
};

const changePassword = async (data) => {
    const res = await api.patch(
        "/branches/change-password",
        data
    );

    return res.data;
};

export default {
    getProfile,
    changePassword,
};