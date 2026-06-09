'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ui.css';

/* ---- Context ---- */
const ToastContext = createContext(null);

let toastId = 0;
const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

/* ---- Toast Provider (wraps your app) ---- */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (opts) => {
      if (typeof opts === 'string') return addToast({ message: opts });
      return addToast(opts);
    },
    [addToast]
  );

  toast.success = (message, opts) => addToast({ type: 'success', message, ...opts });
  toast.error = (message, opts) => addToast({ type: 'error', message, ...opts });
  toast.warning = (message, opts) => addToast({ type: 'warning', message, ...opts });
  toast.info = (message, opts) => addToast({ type: 'info', message, ...opts });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/* ---- Container (renders via portal) ---- */
export function ToastContainer({ toasts, onRemove }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div className="mm-toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

/* ---- Single Toast ---- */
function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div className={`mm-toast mm-toast--${toast.type} ${toast.exiting ? 'mm-toast--exiting' : ''}`}>
      <span className="mm-toast__icon">{ICONS[toast.type]}</span>
      <div className="mm-toast__content">
        {toast.title && <div className="mm-toast__title">{toast.title}</div>}
        <div className="mm-toast__message">{toast.message}</div>
      </div>
      <button className="mm-toast__close" onClick={() => onRemove(toast.id)} aria-label="Dismiss">
        ✕
      </button>
      {toast.duration && (
        <div
          className="mm-toast__progress"
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      )}
    </div>
  );
}

/* ---- Hook ---- */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
