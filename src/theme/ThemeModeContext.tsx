import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { darkTheme, lightTheme } from "./theme";
import { GlobalStyle } from "./GlobalStyle";

export type ThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

const KEY = "tesms.theme";

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  // System preference on first visit, then the remembered manual choice.
  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(stored ?? (prefersDark ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeModeContext.Provider value={{ theme, toggleTheme }}>
      <StyledThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = (): ThemeModeContextValue =>
  useContext(ThemeModeContext);
