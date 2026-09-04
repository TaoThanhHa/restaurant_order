import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const themes = [
    { id: "lang-tre", name: "Làng Tre", color: "#315C45", text: "#26352C", secondary: "#E8F0E8" },
    { id: "bep-go", name: "Bếp Gỗ", color: "#795548", text: "#342820", secondary: "#F0E7DD" },
    { id: "tim-hue", name: "Tím Huế", color: "#6B4C6D", text: "#352A35", secondary: "#F0E8F1" },
    { id: "bien-viet", name: "Biển Việt", color: "#287C8E", text: "#24383D", secondary: "#E4F2F4" },
    { id: "nang-viet", name: "Nắng Việt", color: "#C58A24", text: "#3D3425", secondary: "#FFF2D2" },
    { id: "dat-viet", name: "Đất Việt", color: "#A64032", text: "#3B2924", secondary: "#F6E5E1" },
    { id: "hoa-sen", name: "Hoa Sen", color: "#B85C70", text: "#3D292E", secondary: "#F8E8EB" },
];

const DEFAULT_THEME = "lang-tre";

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(
        () => localStorage.getItem("restaurant-theme") || DEFAULT_THEME
    );

    const [role, setRoleState] = useState(
        () => localStorage.getItem("restaurant-role") || ""
    );

    const setTheme = (themeId) => {
        setThemeState(themeId);
        localStorage.setItem("restaurant-theme", themeId);
    };

    const setRole = (roleName) => {
        const value = roleName?.toUpperCase() || "";

        setRoleState(value);

        if (value) {
            localStorage.setItem("restaurant-role", value);
        } else {
            localStorage.removeItem("restaurant-role");
        }
    };

    useEffect(() => {
        const selectedTheme =
            themes.find((item) => item.id === theme) || themes[0];

        const root = document.documentElement;

        root.setAttribute("data-theme", selectedTheme.id);

        root.style.setProperty("--color-primary", selectedTheme.color);
        root.style.setProperty("--color-primary-secondary", selectedTheme.secondary);
        root.style.setProperty("--color-role-text", selectedTheme.text);

        root.style.setProperty("--color-theme", selectedTheme.color);
        root.style.setProperty("--color-theme-secondary", selectedTheme.secondary);
        root.style.setProperty("--color-text", selectedTheme.text);
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                role,
                themes,
                setTheme,
                setRole,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}