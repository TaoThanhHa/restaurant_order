import axiosClient from "../api/axiosClient";

const login = async (data) => {
    const response = await axiosClient.post("/auth/login", data);
    return response.data;
};

const getProfile = async () => {
    const response = await axiosClient.get("/auth/profile");
    return response.data;
};

const forgotPassword = async (email) => {
    const response = await axiosClient.post(
        "/auth/forgot-password",
        { email }
    );
    return response.data;
};

const resetPassword = async (data) => {
    const response = await axiosClient.post(
        "/auth/reset-password",
        data
    );
    return response.data;
};

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export default {
    login,
    getProfile,
    forgotPassword,
    resetPassword,
    logout,
};