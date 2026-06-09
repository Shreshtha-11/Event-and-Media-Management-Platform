'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ui.css';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose?.();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!mounted || !isOpen) return null;

  const overlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return createPortal(
    <div
      className={`mm-modal-overlay ${closing ? 'mm-modal-overlay--closing' : ''}`}
      onClick={overlayClick}
    >
      <div className={`mm-modal mm-modal--${size} ${closing ? 'mm-modal--closing' : ''}`}>
        {title && (
          <div className="mm-modal__header">
            <h2 className="mm-modal__title">{title}</h2>
            <button className="mm-modal__close" onClick={handleClose} aria-label="Close">
              ✕
            </button>
          </div>
        )}
        <div className="mm-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
