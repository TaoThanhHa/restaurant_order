import api from "../api/axiosClient";

const updateProfile = async (data) => {
    const res = await api.put("/customers/profile", data);
    return res.data;
};

const updatePhone = async (data) => {
    const res = await api.put("/customers/phone", data);
    return res.data;
};

const changePassword = async (data) => {
    const res = await api.put("/customers/password", data);
    return res.data;
};

const sendChangeEmailOtp = async (data) => {
    const res = await api.post("/customers/email/send-otp", data);
    return res.data;
};

const verifyChangeEmailOtp = async (data) => {
    const res = await api.post("/customers/email/verify-otp", data);
    return res.data;
};

export default {
    updateProfile,
    updatePhone,
    changePassword,
    sendChangeEmailOtp,
    verifyChangeEmailOtp,
};