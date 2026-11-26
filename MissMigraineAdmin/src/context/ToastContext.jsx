import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-success',
    iconColor: 'text-wisteria-50',
    textColor: 'text-wisteria-50',
    closeColor: 'text-wisteria-50/70 hover:text-wisteria-50',
  },
  error: {
    icon: AlertTriangle,
    bg: 'bg-danger',
    iconColor: 'text-wisteria-50',
    textColor: 'text-wisteria-50',
    closeColor: 'text-wisteria-50/70 hover:text-wisteria-50',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning',
    iconColor: 'text-wisteria-950',
    textColor: 'text-wisteria-950',
    closeColor: 'text-wisteria-950/70 hover:text-wisteria-950',
  },
  info: {
    icon: Info,
    bg: 'bg-wisteria-500',
    iconColor: 'text-wisteria-50',
    textColor: 'text-wisteria-50',
    closeColor: 'text-wisteria-50/70 hover:text-wisteria-50',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ toasts, showToast, dismiss }),
    [toasts, showToast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container — top right */}
      <div
        className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
          const Icon = style.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 min-w-[300px] max-w-[420px] rounded-2xl px-5 py-4 shadow-2xl ${style.bg}`}
              role="status"
            >
              <Icon
                size={22}
                strokeWidth={2.2}
                className={`shrink-0 ${style.iconColor}`}
              />
              <p className={`flex-1 font-plein-medium text-base leading-6 ${style.textColor}`}>
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className={`shrink-0 p-1.5 rounded-md transition-colors ${style.closeColor}`}
              >
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}