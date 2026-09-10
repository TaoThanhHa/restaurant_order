import axiosClient from "../api/axiosClient";

const getTable = async (qrCode) => {

    const res = await axiosClient.get(
        `/customer/table/${qrCode}`
    );

    return res.data;
};

const guest = async (data) => {

    const res = await axiosClient.post(
        "/customer/guest",
        data
    );

    return res.data;
};


const register = async (data) => {

    const res = await axiosClient.post(
        "/customer/register",
        data
    );

    return res.data;
};

const login = async (data) => {

    const res = await axiosClient.post(
        "/customer/login",
        data
    );

    return res.data;
};

const forgotPassword = async (email) => {

    const res = await axiosClient.post(
        "/customer/forgot-password",
        {
            email,
        }
    );

    return res.data;
};


const verifyOtp = async (data) => {

    const res = await axiosClient.post(
        "/customer/verify-otp",
        data
    );

    return res.data;
};


const resetPassword = async (data) => {

    const res = await axiosClient.post(
        "/customer/reset-password",
        data
    );

    return res.data;
};

const profile = async () => {

    const res = await axiosClient.get(
        "/customer/profile"
    );

    return res.data;
};

export default {
    getTable,
    guest,
    register,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    profile,
};