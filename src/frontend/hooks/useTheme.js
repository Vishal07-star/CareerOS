import { useEffect, useState } from "react";

// Canonical storage key. Older builds of the Recruiter shell stored the
// preference under "careeros-theme" directly (bypassing this hook); we keep
// that as the single source of truth going forward and fall back to reading
// the legacy "theme" key (written by an earlier, now-removed duplicate
// implementation of this same hook) so existing users don't lose their
// preference on upgrade.
const STORAGE_KEY = "careeros-theme";
const LEGACY_STORAGE_KEY = "theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
    // Keep the legacy key in sync too, in case any other tab/session is
    // still reading it.
    localStorage.setItem(LEGACY_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (value) => {
    setThemeState(value === "dark" ? "dark" : "light");
  };

  const toggleTheme = () => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  };

  return [theme, setTheme, toggleTheme];
}