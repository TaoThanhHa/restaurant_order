import api from "../api/axiosClient";

const uploadFood = (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/food",
        formData,
        {headers: {"Content-Type": "multipart/form-data",},}
    );
};

const uploadRestaurantLogo = (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/restaurant-logo",
        formData,
        {headers: {"Content-Type": "multipart/form-data", },}
    );
};

const uploadCustomerAvatar = (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/customer-avatar",
        formData,
        {headers: { "Content-Type": "multipart/form-data", },}
    );
};

export default {
    uploadFood,
    uploadRestaurantLogo,
    uploadCustomerAvatar,
};