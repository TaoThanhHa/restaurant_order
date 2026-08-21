import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const ThemeContext = createContext(null);

export const THEMES = [
    {
        id: "lang-tre",
        name: "Làng Tre",
        color: "#315C45",
        text: "#26352C",
        secondary:"#E8F0E8"
    },
    {
        id: "bep-go",
        name: "Bếp Gỗ",
        color: "#795548",
        text:"#342820",
        secondary:"#F0E7DD",
    },
    {
        id: "tim-hue",
        name: "Tím Huế",
        color: "#6B4C6D",
        text:"#352A35",
        secondary:"#F7F1F5",
    },
    {
        id: "bien-viet",
        name: "Biển Việt",
        color: "#287C8E",
        text:"#24383D",
        secondary:"#E4F2F4",
    },
    {
        id: "nang-viet",
        name: "Nắng Việt",
        color: "#C58A24",
        text: "#3D3425",
        secondary:"#FFF8E8",
    },
    {
        id: "dat-viet",
        name: "Đất Việt",
        color: "#A64032",
        text: "#3B2924",
        secondary:"#FAF2E4",
    },
    {
        id: "hoa-sen",
        name: "Hoa Sen",
        color: "#B85C70",
        text: "#3D292E",
        secondary:"#F8E8EB",
    },
];

export function ThemeProvider({ children }) {

    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "lang-tre"
    );

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                themes: THEMES,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}