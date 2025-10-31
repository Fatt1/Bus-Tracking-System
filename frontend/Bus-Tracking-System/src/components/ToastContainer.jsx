import React from "react";
import { useNotification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { getAuthRoles } from "../utils/auth";
import { FiBell, FiX } from "react-icons/fi";
import "./ToastContainer.css";

const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();
  const navigate = useNavigate();
  const roles = getAuthRoles();

  const handleToastClick = (toastId) => {
    // Navigate based on role
    if (roles.includes("Admin")) {
      navigate("/notification");
    } else if (roles.includes("Driver")) {
      navigate("/driver/notifications");
    } else if (roles.includes("Parent")) {
      navigate("/parent/notifications");
    }
    // Remove toast after navigation
    removeToast(toastId);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-notification"
          onClick={() => handleToastClick(toast.id)}
        >
          <div className="toast-icon">
            <FiBell size={20} />
          </div>
          <div className="toast-content">
            <h4 className="toast-title">{toast.title}</h4>
            <p className="toast-message">{toast.message}</p>
            <span className="toast-time">{toast.timestamp}</span>
          </div>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
          >
            <FiX size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
