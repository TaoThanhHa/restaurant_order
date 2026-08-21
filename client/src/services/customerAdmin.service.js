import api from "../api/axiosClient";

const getAll = async ({
    period = "month",
    year,
    value,
    search = "",
    sort = "visits_desc",
} = {}) => {

    const res = await api.get("/customer-admin", {
        params: {
            period,
            year,
            value,
            search,
            sort,
        },
    });

    return res.data;
};

const getById = async (id, period = "month") => {

    const res = await api.get(
        `/customer-admin/${id}`,
        {
            params: {
                period,
            },
        }
    );

    return res.data;
};

export default {
    getAll,
    getById,
};