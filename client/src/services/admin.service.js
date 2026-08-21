import api from "../api/axiosClient";

const getProfile = async () => {

    const res =
        await api.get("/admin/profile");

    return res.data;
};

const updateRestaurant = async (data) => {

    const res =
        await api.put(
            "/admin/restaurant",
            data
        );

    return res.data;
};


const requestChangeEmail = async (
    newEmail
) => {

    const res =
        await api.post(
            "/admin/change-email/request",
            {
                newEmail,
            }
        );

    return res.data;
};


const verifyChangeEmail = async (otp) => {

    const res =
        await api.post(
            "/admin/change-email/verify",
            {
                otp,
            }
        );

    return res.data;
};


const changePassword = async (
    data
) => {

    const res =
        await api.patch(
            "/admin/change-password",
            data
        );

    return res.data;
};



export default {
    getProfile,
    updateRestaurant,
    requestChangeEmail,
    verifyChangeEmail,
    changePassword,
};