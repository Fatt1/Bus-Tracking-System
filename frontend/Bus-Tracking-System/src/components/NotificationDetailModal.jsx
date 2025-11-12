import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./NotificationDetailModal.css";

const NotificationDetailModal = ({ 
  isOpen, 
  onClose, 
  notification, 
  onMarkAsRead 
}) => {
  const { t } = useTranslation();
  const [isRecipientListExpanded, setIsRecipientListExpanded] = useState(false);

  // Auto mark as read when opening an unread inbox notification
  useEffect(() => {
    if (isOpen && notification && notification.type === "inbox" && !notification.isRead) {
      onMarkAsRead(notification.id);
    }
  }, [isOpen, notification, onMarkAsRead]);

  // Reset expanded state when modal opens/closes or notification changes
  useEffect(() => {
    if (!isOpen) {
      setIsRecipientListExpanded(false);
    }
  }, [isOpen, notification]);

  if (!isOpen || !notification) return null;

  // Check if notification has multiple recipients (for sent notifications)
  const hasMultipleRecipients = 
    notification.type === "sent" && 
    notification.recipientList && 
    notification.recipientList.length > 1;

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
            {hasMultipleRecipients ? (
              <div className="detail-value recipient-list-container">
                <div 
                  className="recipient-count-toggle"
                  onClick={() => setIsRecipientListExpanded(!isRecipientListExpanded)}
                >
                  <span>{notification.recipient}</span> {/* Shows "X người nhận" */}
                  {isRecipientListExpanded ? (
                    <FaChevronUp className="toggle-icon" />
                  ) : (
                    <FaChevronDown className="toggle-icon" />
                  )}
                </div>
                {isRecipientListExpanded && (
                  <div className="recipient-list-scrollable">
                    {notification.recipientList.map((recipient, index) => (
                      <div key={recipient.recipientUserId || index} className="recipient-item">
                        <span className="recipient-number">{index + 1}.</span>
                        <span className="recipient-name">{recipient.recipientUserName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="detail-value">
                {notification.type === "inbox" ? notification.sender : notification.recipient}
              </div>
            )}
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
