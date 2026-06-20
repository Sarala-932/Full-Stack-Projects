import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("app-theme") || "theme-blue";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "theme-blue", "theme-black", "dark");

        if (theme === "light") {
            root.classList.add("light");
        } else {
            root.classList.add(theme);
            root.classList.add("dark");
        }

        localStorage.setItem("app-theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
