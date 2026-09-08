import axiosClient from "../api/axiosClient";


// ======================================================
// GET TABLE
// ======================================================

const getTable = async (qrCode) => {

    const res = await axiosClient.get(
        `/customer/table/${qrCode}`
    );

    return res.data;
};


// ======================================================
// GUEST LOGIN
// ======================================================

const guest = async (data) => {

    const res = await axiosClient.post(
        "/customer/guest",
        data
    );

    return res.data;
};


// ======================================================
// REGISTER
// ======================================================

const register = async (data) => {

    const res = await axiosClient.post(
        "/customer/register",
        data
    );

    return res.data;
};


// ======================================================
// LOGIN
// ======================================================

const login = async (data) => {

    const res = await axiosClient.post(
        "/customer/login",
        data
    );

    return res.data;
};


// ======================================================
// PROFILE
// ======================================================

const profile = async () => {

    const res = await axiosClient.get(
        "/customer/profile"
    );

    return res.data;
};


// ======================================================
// EXPORT
// ======================================================

export default {

    getTable,

    guest,

    register,

    login,

    profile,

};