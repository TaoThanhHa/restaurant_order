import { createContext, useContext, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

const ThemeContext = createContext(null);

export const themes = [
    { id: "lang-tre", name: "Làng Tre", color: "#315C45", text: "#26352C", secondary: "#E8F0E8" },
    { id: "bep-go", name: "Bếp Gỗ", color: "#795548", text: "#342820", secondary: "#F0E7DD" },
    { id: "tim-hue", name: "Tím Huế", color: "#6B4C6D", text: "#352A35", secondary: "#F0E8F1" },
    { id: "bien-viet", name: "Biển Việt", color: "#287C8E", text: "#24383D", secondary: "#E4F2F4" },
    { id: "nang-viet", name: "Nắng Việt", color: "#C58A24", text: "#3D3425", secondary: "#FFF2D2" },
    { id: "dat-viet", name: "Đất Việt", color: "#A64032", text: "#3B2924", secondary: "#F6E5E1" },
    { id: "hoa-sen", name: "Hoa Sen", color: "#B85C70", text: "#3D292E", secondary: "#F8E8EB" }
];

const DEFAULT_THEME = "lang-tre";

export function ThemeProvider({ children }) {
    const { user } = useAuth();
    const [theme, setThemeState] = useState(DEFAULT_THEME);

    const setTheme = (themeId) => {
        if (!themes.some((item) => item.id === themeId)) return;
        setThemeState(themeId);
    };

    useEffect(() => {
        const restaurantTheme = user?.restaurantTheme;

        if (themes.some((item) => item.id === restaurantTheme)) {
            setThemeState(restaurantTheme);
        } else {
            setThemeState(DEFAULT_THEME);
        }
    }, [user?.restaurantTheme]);

    useEffect(() => {
        if (!user?.restaurantId) return;

        const token = localStorage.getItem("token");

        if (!token) return;

        const apiUrl = import.meta.env.VITE_API_URL;

        const eventSource = new EventSource(
            `${apiUrl}/events/restaurant?token=${encodeURIComponent(token)}`
        );

        eventSource.addEventListener(
            "restaurant.theme.updated",
            (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (
                        Number(data.restaurantId) !==
                        Number(user.restaurantId)
                    ) {
                        return;
                    }

                    if (
                        !themes.some(
                            (item) => item.id === data.theme
                        )
                    ) {
                        return;
                    }

                    setThemeState(data.theme);

                    const storedUser =
                        localStorage.getItem("user");

                    if (storedUser) {
                        const userData =
                            JSON.parse(storedUser);

                        userData.restaurantTheme =
                            data.theme;

                        localStorage.setItem(
                            "user",
                            JSON.stringify(userData)
                        );
                    }
                } catch (error) {
                    console.error(
                        "SSE THEME EVENT ERROR:",
                        error
                    );
                }
            }
        );

        eventSource.onerror = (error) => {
            console.error(
                "SSE RESTAURANT ERROR:",
                error
            );
        };

        return () => {
            eventSource.close();
        };
    }, [user?.restaurantId]);

    useEffect(() => {
        const selectedTheme =
            themes.find((item) => item.id === theme) ||
            themes[0];

        const root = document.documentElement;

        root.setAttribute(
            "data-theme",
            selectedTheme.id
        );

        root.style.setProperty(
            "--color-primary",
            selectedTheme.color
        );

        root.style.setProperty(
            "--color-secondary",
            selectedTheme.secondary
        );

        root.style.setProperty(
            "--color-primary-secondary",
            selectedTheme.secondary
        );

        root.style.setProperty(
            "--color-theme",
            selectedTheme.color
        );

        root.style.setProperty(
            "--color-theme-secondary",
            selectedTheme.secondary
        );

        root.style.setProperty(
            "--color-text",
            selectedTheme.text
        );

        root.style.setProperty(
            "--color-role-text",
            selectedTheme.text
        );
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themes,
                setTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme phải được sử dụng bên trong ThemeProvider"
        );
    }

    return context;
}
