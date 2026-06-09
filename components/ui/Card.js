'use client';

import './ui.css';

export default function Card({
  children,
  className = '',
  hoverable = false,
  glassmorphism = false,
  padding = 'md',
  onClick,
}) {
  const classes = [
    'mm-card',
    glassmorphism && 'mm-card--glass',
    hoverable && 'mm-card--hoverable',
    `mm-card--p-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
}
