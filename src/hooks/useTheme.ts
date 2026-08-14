import { useEffect, useState, useCallback } from "react";
import type { EffectiveTheme, ThemeMode } from "../types";
import { getSetting, saveSetting } from "../services/db";

const THEME_STORAGE_KEY = "levelup.setting.theme_mode";

function getSystemPreference(): EffectiveTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed === "system" || parsed === "light" || parsed === "dark") {
        return parsed;
      }
    }
  } catch {
    /* fallback */
  }
  return "system";
}

function applyThemeToDOM(effective: EffectiveTheme) {
  const root = document.documentElement;
  if (effective === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }
}

export function useTheme() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialThemeMode);
  const [systemPreference, setSystemPreference] = useState<EffectiveTheme>(getSystemPreference);

  // Compute effective theme
  const effectiveTheme: EffectiveTheme =
    themeMode === "system" ? systemPreference : themeMode;

  // Load saved preference from DB on mount
  useEffect(() => {
    let isMounted = true;
    getSetting<ThemeMode>("theme_mode", themeMode).then((dbVal) => {
      if (isMounted && dbVal && (dbVal === "system" || dbVal === "light" || dbVal === "dark")) {
        setThemeModeState(dbVal);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to OS system color scheme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Legacy API
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Apply DOM classes whenever effective theme changes
  useEffect(() => {
    applyThemeToDOM(effectiveTheme);
  }, [effectiveTheme]);

  // Handler to change theme mode with persistence
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(mode));
      saveSetting("theme_mode", mode);
    } catch (err) {
      console.warn("Failed to persist theme mode:", err);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((curr) => {
      const next: ThemeMode =
        curr === "system" ? "dark" : curr === "dark" ? "light" : "system";
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
      saveSetting("theme_mode", next);
      return next;
    });
  }, []);

  return {
    themeMode,
    effectiveTheme,
    isDark: effectiveTheme === "dark",
    setThemeMode,
    toggleTheme,
  };
}
