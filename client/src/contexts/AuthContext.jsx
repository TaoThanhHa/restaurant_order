import { createContext, useState } from "react";
import authService from "../services/auth.service";

export const AuthContext = createContext();

const THEME_KEY = "restaurant-theme";
const ROLE_KEY = "restaurant-role";

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const userStorage = localStorage.getItem("user");

        try {
            return userStorage ? JSON.parse(userStorage) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const [loading] = useState(false);

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
    };

    const logout = () => {
        const savedTheme = localStorage.getItem(THEME_KEY);

        authService.logout();

        if (savedTheme) {
            localStorage.setItem(THEME_KEY, savedTheme);
        }

        localStorage.removeItem(ROLE_KEY);

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
