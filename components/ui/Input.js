'use client';

import { useId } from 'react';
import './ui.css';

export default function Input({
  label,
  type = 'text',
  placeholder = ' ',
  value,
  onChange,
  error,
  icon,
  required = false,
  className = '',
  ...rest
}) {
  const id = useId();

  return (
    <div className={`mm-input-wrapper ${className}`}>
      <div className="mm-input-field-wrap">
        {icon && <span className="mm-input-icon">{icon}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`mm-input ${icon ? 'mm-input--has-icon' : ''} ${error ? 'mm-input--error' : ''}`}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {label && (
          <label htmlFor={id} className={`mm-input-label ${icon ? 'mm-input--has-icon' : ''}`}>
            {label}
            {required && <span className="mm-input-required">*</span>}
          </label>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className="mm-input-error" role="alert">
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
