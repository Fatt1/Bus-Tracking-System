import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./NotificationDetailModal.css";

const NotificationDetailModal = ({ 
  isOpen, 
  onClose, 
  notification, 
  onMarkAsRead 
}) => {
  const { t } = useTranslation();

  // Auto mark as read when opening an unread inbox notification
  useEffect(() => {
    if (isOpen && notification && notification.type === "inbox" && !notification.isRead) {
      onMarkAsRead(notification.id);
    }
  }, [isOpen, notification, onMarkAsRead]);

  if (!isOpen || !notification) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="notification-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notification-detail-header">
          <h3>{t("notification.detailTitle")}</h3>
        </div>

        <div className="notification-detail-body">
          <div className="detail-row">
            <div className="detail-label">{t("notification.notificationTitle")}:</div>
            <div className="detail-value">{notification.subject}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              {notification.type === "inbox" ? t("notification.from") : t("notification.to")}:
            </div>
            <div className="detail-value">
              {notification.type === "inbox" ? notification.sender : notification.recipient}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">{t("notification.message")}:</div>
            <div className="detail-value message-content">{notification.message}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">{t("notification.time")}:</div>
            <div className="detail-value">{notification.timestamp}</div>
          </div>
        </div>

        <div className="notification-detail-footer">
          <button className="detail-close-btn" onClick={onClose}>
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
