'use client';

import './ui.css';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}) {
  const classes = [
    'mm-badge',
    `mm-badge--${variant}`,
    `mm-badge--${size}`,
    pulse && 'mm-badge--pulse',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
