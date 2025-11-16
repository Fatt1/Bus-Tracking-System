import React from "react";
import "./ConfirmModal.css";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "confirm", // "confirm", "alert", "success", "error"
  confirmText = "Xác nhận",
  cancelText = "Hủy",
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="modal-icon success" />;
      case "error":
        return <FaExclamationTriangle className="modal-icon error" />;
      case "alert":
        return <FaExclamationTriangle className="modal-icon warning" />;
      default:
        return <FaExclamationTriangle className="modal-icon confirm" />;
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleCancel}>
      <div
        className="confirm-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={handleCancel}>
          <FaTimes />
        </button>

        <div className="modal-icon-wrapper">{getIcon()}</div>

        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          {type !== "alert" && (
            <button className="modal-btn cancel-btn" onClick={handleCancel}>
              {cancelText}
            </button>
          )}
          <button className="modal-btn confirm-btn" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
