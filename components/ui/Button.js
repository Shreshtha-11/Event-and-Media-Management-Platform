'use client';

import { useRef, useCallback } from 'react';
import './ui.css';

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  ...rest
}) {
  const btnRef = useRef(null);

  const handleClick = useCallback(
    (e) => {
      if (loading || disabled) return;

      /* Ripple */
      const btn = btnRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        ripple.className = 'mm-btn__ripple';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }

      onClick?.(e);
    },
    [onClick, loading, disabled]
  );

  const classes = [
    'mm-btn',
    `mm-btn--${variant}`,
    `mm-btn--${size}`,
    fullWidth && 'mm-btn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={btnRef}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...rest}
    >
      {loading && <span className="mm-btn__spinner" />}
      {!loading && icon && <span className="mm-btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
