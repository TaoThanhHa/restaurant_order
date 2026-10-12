import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const isCustomerRequest = (url = "") => {
    return (
        url === "/customer" ||
        url.startsWith("/customer/") ||
        url.startsWith("/auth/customer") ||
        url.startsWith("/customer-auth")
    );
};

const isCustomerPage = () => {
    const path = window.location.pathname;

    return (
        path === "/customer" ||
        path.startsWith("/customer/")
    );
};

axiosClient.interceptors.request.use(
    config => {
        const customerRequest =
            isCustomerRequest(config.url) ||
            config.customerAuth ||
            isCustomerPage();

        const token = customerRequest
            ? localStorage.getItem("customerToken")
            : localStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        delete config.customerAuth;

        return config;
    },
    error => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status;
        const url = error.config?.url || "";

        const customerRequest =
            isCustomerRequest(url) || isCustomerPage();

        if (status === 401 && !customerRequest) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

        return Promise.reject(error);
    }
);

export default axiosClient;