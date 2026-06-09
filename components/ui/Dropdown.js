'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import './ui.css';

export default function Dropdown({
  trigger,
  items = [],
  onSelect,
  align = 'left',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef(null);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 150);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open, close]);

  const handleSelect = (item) => {
    onSelect?.(item);
    close();
  };

  return (
    <div className={`mm-dropdown ${className}`} ref={ref}>
      <div className="mm-dropdown__trigger" onClick={() => (open ? close() : setOpen(true))}>
        {trigger}
      </div>
      {open && (
        <div className={`mm-dropdown__menu mm-dropdown__menu--${align} ${closing ? 'mm-dropdown__menu--closing' : ''}`}>
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={`d-${i}`} className="mm-dropdown__divider" />;
            }
            return (
              <button
                key={item.key || i}
                className={`mm-dropdown__item ${item.danger ? 'mm-dropdown__item--danger' : ''}`}
                onClick={() => handleSelect(item)}
              >
                {item.icon && <span className="mm-dropdown__item-icon">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
