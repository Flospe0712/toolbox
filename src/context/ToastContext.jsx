import React, { createContext, useContext, useState } from 'react';

/**
 * Toast Context
 * Provides toast notification functionality throughout the app
 */
const ToastContext = createContext();

/**
 * Toast Provider Component
 * Wrap your app with this to enable toast notifications
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - 'success', 'error', 'info', 'warning'
   * @param {number} duration - Auto-dismiss time in ms (0 = no auto-dismiss)
   */
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss if duration > 0
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  };

  /**
   * Dismiss a toast by id
   * @param {number} id - Toast id
   */
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Dismiss all toasts
   */
  const dismissAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, dismissAll, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 * @returns {{showToast: Function, dismissToast: Function, dismissAll: Function}}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
