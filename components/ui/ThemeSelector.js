'use client';

import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../styles/themes';
import './ui.css';

export default function ThemeSelector({ className = '' }) {
  const { theme: currentTheme, mode, setTheme, toggleMode } = useTheme();

  return (
    <div className={`mm-theme-selector ${className}`}>
      <div className="mm-theme-selector__title">Choose Theme</div>

      <div className="mm-theme-selector__grid">
        {Object.entries(themes).map(([key, themeData]) => {
          const colors = themeData.light;
          const isActive = currentTheme === key;
          return (
            <div
              key={key}
              className={`mm-theme-card ${isActive ? 'mm-theme-card--active' : ''}`}
              onClick={() => setTheme(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setTheme(key)}
            >
              <div className="mm-theme-card__check">✓</div>
              <div className="mm-theme-card__icon">{themeData.icon}</div>
              <div className="mm-theme-card__name">{themeData.name}</div>
              <div className="mm-theme-card__swatches">
                <div
                  className="mm-theme-card__swatch"
                  style={{ background: colors.primary }}
                  title="Primary"
                />
                <div
                  className="mm-theme-card__swatch"
                  style={{ background: colors.secondary }}
                  title="Secondary"
                />
                <div
                  className="mm-theme-card__swatch"
                  style={{ background: colors.accent }}
                  title="Accent"
                />
                <div
                  className="mm-theme-card__swatch"
                  style={{ background: colors.bg }}
                  title="Background"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mm-theme-mode-toggle">
        <span className="mm-theme-mode-toggle__label">
          {mode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </span>
        <button
          className={`mm-theme-mode-toggle__btn ${mode === 'dark' ? 'mm-theme-mode-toggle__btn--dark' : ''}`}
          onClick={toggleMode}
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="mm-theme-mode-toggle__icon">
            {mode === 'dark' ? '🌙' : '☀️'}
          </span>
        </button>
      </div>
    </div>
  );
}
