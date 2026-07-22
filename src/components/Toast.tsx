import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} style={{ color: '#2ecc71', flexShrink: 0 }} />,
    error: <XCircle size={18} style={{ color: '#e74c3c', flexShrink: 0 }} />,
    info: <Info size={18} style={{ color: '#3498db', flexShrink: 0 }} />,
  };

  const bgMap: Record<ToastType, string> = {
    success: '#f0faf4',
    error: '#fef2f2',
    info: '#f0f7ff',
  };

  const borderMap: Record<ToastType, string> = {
    success: '#2ecc71',
    error: '#e74c3c',
    info: '#3498db',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: bgMap[toast.type],
              borderLeft: `4px solid ${borderMap[toast.type]}`,
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              animation: 'toastSlideIn 0.3s ease-out',
              pointerEvents: 'auto'
            }}
          >
            {iconMap[toast.type]}
            <span style={{ flex: 1, fontSize: '0.85rem', color: '#333', lineHeight: 1.4 }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: '#999',
                flexShrink: 0
              }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
