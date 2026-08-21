import { useNavigate } from "react-router-dom";

export default function useCustomerAuth() {

    const navigate = useNavigate();

    const login = (token, customer) => {

        localStorage.setItem(
            "customerToken",
            token
        );

        localStorage.setItem(
            "customer",
            JSON.stringify(customer)
        );

    };

    const logout = () => {

        localStorage.removeItem("customer");

        localStorage.removeItem("customerToken");

        navigate("/");

    };

    const customer = JSON.parse(
        localStorage.getItem("customer")
    );

    return {
        customer,
        login,
        logout,
    };

}