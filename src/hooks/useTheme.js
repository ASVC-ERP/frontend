import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "theme";

const getInitialTheme = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "dark" ? "dark" : "light";
};

// Shell-only dark mode (sidebar + page canvas — see styles/theme.css).
// Applied via data-theme on <html> so plain CSS can target it, and
// persisted so the choice survives a reload.
export const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
};
