'use client';

import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { themes, defaultTheme, defaultMode } from '@/styles/themes';

const ThemeContext = createContext(undefined);

/**
 * Maps a flat color token object from themes.js to CSS custom properties
 * and applies them to document.documentElement.
 */
function applyThemeToDOM(colors) {
  const root = document.documentElement;
  const map = {
    '--color-primary': colors.primary,
    '--color-primary-light': colors.primaryLight,
    '--color-primary-dark': colors.primaryDark,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-bg': colors.bg,
    '--color-bg-secondary': colors.bgSecondary,
    '--color-bg-tertiary': colors.bgTertiary,
    '--color-surface': colors.surface,
    '--color-surface-hover': colors.surfaceHover,
    '--color-text': colors.text,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-muted': colors.textMuted,
    '--color-border': colors.border,
    '--color-shadow': colors.shadow,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-info': colors.info,
    '--gradient-primary': colors.gradientPrimary,
    '--gradient-hero': colors.gradientHero,
    '--glass-bg': colors.glassBg,
    '--glass-border': colors.glassBorder,
  };

  Object.entries(map).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mogger-theme') || defaultTheme;
    }
    return defaultTheme;
  });

  const [mode, setModeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mogger-mode') || defaultMode;
    }
    return defaultMode;
  });

  const currentColors = useMemo(() => {
    const schemeData = themes[theme] || themes[defaultTheme];
    return schemeData[mode] || schemeData[defaultMode];
  }, [theme, mode]);

  // Apply CSS custom properties whenever theme or mode changes
  useEffect(() => {
    applyThemeToDOM(currentColors);
    // Also set a data attribute for potential CSS-only selectors
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', mode);
  }, [currentColors, theme, mode]);

  const setTheme = useCallback((newTheme) => {
    if (themes[newTheme]) {
      setThemeState(newTheme);
      localStorage.setItem('mogger-theme', newTheme);
    }
  }, []);

  const setMode = useCallback((newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setModeState(newMode);
      localStorage.setItem('mogger-mode', newMode);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mogger-mode', next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, mode, setTheme, setMode, toggleMode, currentColors }),
    [theme, mode, setTheme, setMode, toggleMode, currentColors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
