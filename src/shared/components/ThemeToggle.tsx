import styled from "styled-components";
import { useThemeMode } from "@/theme";

const ToggleButton = styled.button`
  display: inline-flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full};
  border: 1px solid ${({ theme }) => theme.color.borderStrong};
  background-color: ${({ theme }) => (theme.name === "dark" ? theme.color.card : "rgba(255,255,255,0.8)")};
  font-size: 1rem;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => (theme.name === "dark" ? theme.color.mutedStrong : theme.color.muted)};
  }
`;

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeMode();
  return (
    <ToggleButton
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </ToggleButton>
  );
}
