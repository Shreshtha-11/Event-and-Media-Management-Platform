'use client';

import './ui.css';

export default function Loader({
  size = 'md',
  type = 'spinner',
  className = '',
}) {
  const classes = `mm-loader mm-loader--${size} ${className}`;

  if (type === 'spinner') {
    return (
      <div className={classes} role="status" aria-label="Loading">
        <div className="mm-loader__spinner" />
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={classes} role="status" aria-label="Loading">
        <div className="mm-loader__dots">
          <span className="mm-loader__dot" />
          <span className="mm-loader__dot" />
          <span className="mm-loader__dot" />
        </div>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={classes} role="status" aria-label="Loading">
        <div className="mm-loader__pulse" />
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={`${classes}`} role="status" aria-label="Loading">
        <div className="mm-loader__skeleton" />
      </div>
    );
  }

  return null;
}
