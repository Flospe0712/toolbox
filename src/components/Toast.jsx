import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Toast Display Component
 * Renders all active toast notifications
 * Should be placed at the root level of your app
 */
export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}

/**
 * Individual Toast Component
 */
function Toast({ id, message, type = 'info', onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  // Handle exit animation
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match transition duration
  };

  const typeConfig = {
    success: {
      bg: 'bg-green-900',
      border: 'border-green-700',
      text: 'text-green-100',
      icon: '✓',
      iconColor: 'text-green-400',
    },
    error: {
      bg: 'bg-red-900',
      border: 'border-red-700',
      text: 'text-red-100',
      icon: '✕',
      iconColor: 'text-red-400',
    },
    info: {
      bg: 'bg-blue-900',
      border: 'border-blue-700',
      text: 'text-blue-100',
      icon: 'ℹ',
      iconColor: 'text-blue-400',
    },
    warning: {
      bg: 'bg-yellow-900',
      border: 'border-yellow-700',
      text: 'text-yellow-100',
      icon: '⚠',
      iconColor: 'text-yellow-400',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3
        px-4 py-3
        rounded-lg
        border
        ${config.bg}
        ${config.border}
        ${config.text}
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
        shadow-lg
        min-w-[300px]
      `}
    >
      {/* Icon */}
      <span className={`text-lg font-bold flex-shrink-0 ${config.iconColor}`}>
        {config.icon}
      </span>

      {/* Message */}
      <div className="flex-1 break-words text-sm">{message}</div>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Helper component to easily trigger toasts from anywhere
 * Usage in a component:
 * const { showToast } = useToast();
 * showToast('Success!', 'success');
 * showToast('Error occurred', 'error');
 * showToast('Info message', 'info');
 * showToast('Warning!', 'warning');
 */
export default Toast;
