import api from "../api/axiosClient";

const updateProfile = async (data) => {
    const res = await api.put("/customer/profile", data);
    return res.data;
};

const updatePhone = async (data) => {
    const res = await api.put("/customer/phone", data);
    return res.data;
};

const changePassword = async (data) => {
    const res = await api.put("/customer/password", data);
    return res.data;
};

const sendChangeEmailOtp = async (data) => {
    const res = await api.post("/customer/email/send-otp", data);
    return res.data;
};

const verifyChangeEmailOtp = async (data) => {
    const res = await api.post("/customer/email/verify-otp", data);
    return res.data;
};

const getTable = async (qrCode) => {
    const res = await api.get(`/customer/table/${qrCode}`);
    return res.data;
};

const guest = async (data) => {
    const res = await api.post("/customer/guest", data);
    return res.data;
};

const register = async (data) => {
    const res = await api.post("/customer/register",data);
    return res.data;
};

const login = async (data) => {
    const res = await api.post("/customer/login",data);
    return res.data;
};

const forgotPassword = async (email) => {
    const res = await api.post("/customer/forgot-password",{email,});
    return res.data;
};


const verifyOtp = async (data) => {
    const res = await api.post("/customer/verify-otp",data);
    return res.data;
};


const resetPassword = async (data) => {
    const res = await api.post("/customer/reset-password",data);
    return res.data;
};

const profile = async () => {
    const res = await api.get("/customer/profile");
    return res.data;
};

export default {
    updateProfile,
    updatePhone,
    changePassword,
    sendChangeEmailOtp,
    verifyChangeEmailOtp,
    getTable,
    guest,
    register,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    profile,
};