import api from "../api/axiosClient";

const getPublicInfo = restaurantId => {
    return api.get(`/restaurant/${restaurantId}`);
};

export default {
    getPublicInfo,
};