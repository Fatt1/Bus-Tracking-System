# NotificationDetailModal Component

## Mô tả
Component modal hiển thị chi tiết thông báo khi người dùng click vào một thông báo trong danh sách. Modal tự động đánh dấu thông báo inbox là đã đọc khi được mở.

## Vị trí
- Component: `src/components/NotificationDetailModal.jsx`
- CSS: `src/components/NotificationDetailModal.css`

## Props

| Prop | Type | Required | Mô tả |
|------|------|----------|-------|
| `isOpen` | boolean | Yes | Trạng thái mở/đóng của modal |
| `onClose` | function | Yes | Callback khi đóng modal |
| `notification` | object | Yes | Object chứa thông tin thông báo |
| `onMarkAsRead` | function | Yes | Callback để đánh dấu thông báo đã đọc |

## Cấu trúc Notification Object

```javascript
{
  id: string,              // ID của thông báo (format: "inbox_123" hoặc "sent_456")
  type: "inbox" | "sent",  // Loại thông báo
  subject: string,         // Tiêu đề thông báo
  message: string,         // Nội dung thông báo
  sender: string,          // Tên người gửi (cho inbox)
  recipient: string,       // Tên người nhận (cho sent)
  timestamp: string,       // Thời gian (đã format)
  isRead: boolean          // Trạng thái đã đọc (chỉ cho inbox)
}
```

## Cách sử dụng

### 1. Import Component

```javascript
import NotificationDetailModal from "../../components/NotificationDetailModal";
```

### 2. Thêm State

```javascript
const [selectedNotification, setSelectedNotification] = useState(null);
```

### 3. Tạo Handler Functions

```javascript
// Handler khi click vào thông báo
const handleNotificationClick = (notification) => {
  setSelectedNotification(notification);
};

// Handler để mark as read (cho admin & driver)
const handleMarkAsRead = async (notificationId) => {
  try {
    const parts = notificationId.split("_");
    if (parts[0] !== "inbox") return;
    
    const id = parseInt(parts[1]);
    await api.put(`/api/v1/notificaton/receive/${id}/mark-as-read`);
    
    // Update local state
    setInboxNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    
    // Refresh unread count if using NotificationContext
    refreshUnreadCount();
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
};

// Handler đơn giản hơn cho parent (không cần mark as read API)
const handleMarkAsReadParent = (notificationId) => {
  setNotifications((prev) =>
    prev.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    )
  );
};
```

### 4. Render Modal

```javascript
<NotificationDetailModal
  isOpen={!!selectedNotification}
  onClose={() => setSelectedNotification(null)}
  notification={selectedNotification}
  onMarkAsRead={handleMarkAsRead}  // hoặc handleMarkAsReadParent cho parent
/>
```

### 5. Thêm onClick vào Notification List Item

```javascript
<li 
  className="notification-item"
  onClick={() => handleNotificationClick(notification)}
>
  {/* Notification content */}
</li>
```

## Ví dụ Hoàn chỉnh

### Admin/Driver Notification Page

```javascript
import React, { useState } from "react";
import NotificationDetailModal from "../../components/NotificationDetailModal";
import { useNotification } from "../../context/NotificationContext";
import api from "../../utils/api";

const NotificationPage = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [inboxNotifications, setInboxNotifications] = useState([]);
  const { refreshUnreadCount } = useNotification();

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const parts = notificationId.split("_");
      if (parts[0] !== "inbox") return;
      
      const id = parseInt(parts[1]);
      await api.put(`/api/v1/notificaton/receive/${id}/mark-as-read`);
      
      setInboxNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      refreshUnreadCount();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div>
      {/* Notification list */}
      <ul className="notification-list">
        {inboxNotifications.map((noti) => (
          <li 
            key={noti.id}
            onClick={() => handleNotificationClick(noti)}
          >
            {/* Notification content */}
          </li>
        ))}
      </ul>

      {/* Modal */}
      <NotificationDetailModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};
```

### Parent Notification Page (Đơn giản hơn)

```javascript
import React, { useState } from "react";
import NotificationDetailModal from "../../components/NotificationDetailModal";

const ParentNotificationPage = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleMarkAsRead = (notificationId) => {
    // Parent không cần gọi API, chỉ update local state
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  return (
    <div>
      {/* Notification list */}
      <ul className="notification-list">
        {notifications.map((noti) => (
          <li 
            key={noti.id}
            onClick={() => handleNotificationClick(noti)}
          >
            {/* Notification content */}
          </li>
        ))}
      </ul>

      {/* Modal */}
      <NotificationDetailModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};
```

## Tính năng

### Auto Mark as Read
- Modal tự động đánh dấu thông báo inbox là đã đọc khi mở
- Chỉ áp dụng cho thông báo inbox chưa đọc (`type === "inbox" && !isRead`)
- Thông báo sent không bị ảnh hưởng

### Responsive Design
- Modal responsive, tối ưu cho màn hình nhỏ
- Max width: 600px, Max height: 80vh
- Animation fade-in khi mở

### Click Outside to Close
- Click vào overlay (nền đen) để đóng modal
- Click vào nút "Đóng" để đóng modal
- Click vào nội dung modal không đóng modal

## Translations Required

Component sử dụng các translation keys sau:

```javascript
// Vietnamese (vi/translation.json)
{
  "notification": {
    "detailTitle": "Chi tiết thông báo",
    "notificationTitle": "Tiêu đề",
    "from": "Từ",
    "to": "Đến",
    "message": "Tin nhắn",
    "time": "Thời gian"
  },
  "common": {
    "close": "Đóng"
  }
}

// English (en/translation.json)
{
  "notification": {
    "detailTitle": "Notification Details",
    "notificationTitle": "Title",
    "from": "From",
    "to": "To",
    "message": "Message",
    "time": "Time"
  },
  "common": {
    "close": "Close"
  }
}
```

## Styling

Component sử dụng CSS riêng từ `NotificationDetailModal.css` với các class:

- `.modal-overlay` - Overlay nền đen
- `.notification-detail-modal` - Container modal
- `.notification-detail-header` - Header với gradient xanh
- `.notification-detail-body` - Body chứa nội dung
- `.detail-row` - Mỗi hàng thông tin
- `.detail-label` - Label cho mỗi field
- `.detail-value` - Giá trị của mỗi field
- `.message-content` - Style riêng cho nội dung message
- `.notification-detail-footer` - Footer chứa nút đóng
- `.detail-close-btn` - Nút đóng modal

## Notes

1. **API Endpoint**: Đảm bảo backend có endpoint `/api/v1/notificaton/receive/{id}/mark-as-read`
2. **NotificationContext**: Nếu sử dụng notification bell, cần gọi `refreshUnreadCount()` sau khi mark as read
3. **ID Format**: Notification ID phải có format `"inbox_123"` hoặc `"sent_456"` để phân biệt loại
4. **Parent vs Admin/Driver**: Parent có thể dùng handler đơn giản hơn vì không cần gọi backend API

## Customization

Để customize style, bạn có thể:

1. Override CSS classes trong file CSS của page
2. Thêm className prop vào component (cần modify component)
3. Sửa trực tiếp `NotificationDetailModal.css`

### Ví dụ Override CSS

```css
/* Trong file CSS của page */
.notification-detail-modal .detail-label {
  color: #your-color;
}

.notification-detail-modal .detail-close-btn {
  background: #your-color;
}
```
