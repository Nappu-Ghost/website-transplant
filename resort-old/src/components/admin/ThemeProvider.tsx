"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  // toggleTheme removed as we're enforcing dark mode only
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // Always use dark mode for admin dashboard
  const theme: Theme = "dark";

  // Set up dark mode theme and glassmorphic effects
  useEffect(() => {
    document.documentElement.classList.remove("light-mode", "dark-mode");
    document.documentElement.classList.add("dark-mode");

    // Add custom CSS variables for glassmorphic effects
    document.documentElement.style.setProperty(
      "--glass-background",
      "rgba(18, 18, 18, 0.7)",
    );
    document.documentElement.style.setProperty(
      "--glass-border",
      "rgba(255, 255, 255, 0.1)",
    );
    document.documentElement.style.setProperty(
      "--glass-shadow",
      "0 8px 32px rgba(0, 0, 0, 0.3)",
    );
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
}
