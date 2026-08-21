import api from "../api/axiosClient";

// ======================================================
// UPDATE PROFILE
// ======================================================

const updateProfile = async (data) => {

    const res = await api.put(
        "/customers/profile",
        data
    );

    return res.data;
};

// ======================================================
// UPDATE PHONE
// ======================================================

const updatePhone = async (data) => {

    const res = await api.put(
        "/customers/phone",
        data
    );

    return res.data;
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (data) => {

    const res = await api.put(
        "/customers/password",
        data
    );

    return res.data;
};

// ======================================================
// CHANGE EMAIL - SEND OTP
// ======================================================

const sendChangeEmailOtp = async (data) => {

    const res = await api.post(
        "/customers/email/send-otp",
        data
    );

    return res.data;
};

// ======================================================
// CHANGE EMAIL - VERIFY OTP
// ======================================================

const verifyChangeEmailOtp = async (data) => {

    const res = await api.post(
        "/customers/email/verify-otp",
        data
    );

    return res.data;
};


export default {
    updateProfile,
    updatePhone,
    changePassword,
    sendChangeEmailOtp,
    verifyChangeEmailOtp,
};