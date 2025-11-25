import React from 'react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import './Toast.css';

export const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
  const { toasts, success, error, warning, info, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="toast-wrapper">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};
