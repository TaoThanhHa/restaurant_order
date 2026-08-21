import axiosClient from "../api/axiosClient";

const create = async (data) => {

    const res = await axiosClient.post(
        "/customer/orders",
        data
    );

    return res.data;
};

export default {
    create,
};