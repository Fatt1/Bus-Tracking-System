import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './Toast.css';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon-wrapper">
        {getIcon()}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close-btn" onClick={() => onClose(toast.id)}>
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
