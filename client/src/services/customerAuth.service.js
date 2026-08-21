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
    profile,
};