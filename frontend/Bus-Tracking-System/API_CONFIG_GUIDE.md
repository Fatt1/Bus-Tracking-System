# 📡 Hướng Dẫn Cấu Hình API URL

## 🎯 Mục Đích

Tất cả URL kết nối tới backend đã được tập trung vào **1 file duy nhất**: `src/config/apiConfig.js`

Khi cần đổi URL backend (ví dụ: từ localhost sang production server), bạn **chỉ cần sửa 1 chỗ** thay vì phải vào từng file.

---

## 📂 Vị Trí File Config

```
frontend/Bus-Tracking-System/
└── src/
    └── config/
        └── apiConfig.js  ← FILE QUAN TRỌNG
```

---

## 🔧 Cách Đổi URL Backend

### Bước 1: Mở file config
Mở file: `src/config/apiConfig.js`

### Bước 2: Thay đổi BASE_URL

```javascript
// Trước đây (localhost)
export const BASE_URL = "https://localhost:7229";

// Production (server thật)
export const BASE_URL = "https://api.yourcompany.com";

// Hoặc IP server
export const BASE_URL = "https://192.168.1.100:7229";
```

### Bước 3: Save file và reload browser

Tất cả các file khác sẽ **tự động dùng URL mới** mà không cần sửa gì thêm!

---

## 📋 Các File Đã Được Cập Nhật

Tổng cộng **7 files** đã được cập nhật để sử dụng config chung:

| File | Mô Tả | URL Được Dùng |
|------|-------|---------------|
| `src/utils/api.js` | Axios instance chính | `BASE_URL` |
| `src/App.jsx` | Load dropdown buses | `API_BASE_URL` |
| `src/components/MapComponent.jsx` | SignalR Geolocation Hub | `GEOLOCATION_HUB_URL` |
| `src/components/driver/DriverMapComponent.jsx` | SignalR Geolocation Hub (Driver) | `GEOLOCATION_HUB_URL` |
| `src/context/NotificationContext.jsx` | SignalR Notification Hub | `NOTIFICATION_HUB_URL` |
| `src/pages/LoginPage.jsx` | Login API | `BASE_URL` |
| `src/utils/BusSimulationManager.js` | SignalR Geolocation Hub (Simulation) | `GEOLOCATION_HUB_URL` |
| `src/pages/script.js` | Fetch routes | `API_BASE_URL` |

---

## 📦 Các Biến Config Có Sẵn

File `src/config/apiConfig.js` xuất các biến sau:

```javascript
// URL backend gốc
BASE_URL = "https://localhost:7229"

// URL SignalR Hub cho vị trí xe bus
GEOLOCATION_HUB_URL = "https://localhost:7229/geolocationHub"

// URL SignalR Hub cho thông báo
NOTIFICATION_HUB_URL = "https://localhost:7229/notificationHub"

// Prefix API
API_PREFIX = "/api/v1"

// Full API URL (BASE_URL + API_PREFIX)
API_BASE_URL = "https://localhost:7229/api/v1"
```

---

## 💡 Cách Sử Dụng Trong Code

### Import vào file cần dùng:

```javascript
// Import 1 biến
import { BASE_URL } from "../config/apiConfig";

// Hoặc import nhiều biến
import { BASE_URL, GEOLOCATION_HUB_URL, API_BASE_URL } from "../config/apiConfig";

// Hoặc import tất cả
import apiConfig from "../config/apiConfig";
```

### Sử dụng:

```javascript
// Tạo axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// SignalR connection
const connection = new signalR.HubConnectionBuilder()
  .withUrl(GEOLOCATION_HUB_URL, { ... })
  .build();

// Fetch API
const response = await fetch(`${API_BASE_URL}/route/all`);
```

---

## 🚀 Các Trường Hợp Sử Dụng

### 1. Development (Localhost)
```javascript
export const BASE_URL = "https://localhost:7229";
```

### 2. Production (Server thật)
```javascript
export const BASE_URL = "https://api.bustracking.com";
```

### 3. Testing (Server test)
```javascript
export const BASE_URL = "https://test-api.bustracking.com";
```

### 4. Local Network (IP nội bộ)
```javascript
export const BASE_URL = "https://192.168.1.100:7229";
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Chỉ sửa file `apiConfig.js`** - Không sửa các file khác
2. **Phải có `https://`** hoặc `http://` ở đầu URL
3. **Không có dấu `/` ở cuối** BASE_URL (ví dụ: `https://localhost:7229` ✅, `https://localhost:7229/` ❌)
4. **Sau khi đổi URL**, nhớ:
   - Save file
   - Reload browser (Ctrl+F5)
   - Đăng nhập lại nếu cần

---

## ✅ Kiểm Tra Đã Hoạt Động

Sau khi đổi URL, kiểm tra các chức năng sau:

- [ ] Đăng nhập thành công
- [ ] Dashboard hiển thị danh sách routes
- [ ] Bản đồ hiển thị xe bus di chuyển realtime
- [ ] Thông báo SignalR hoạt động
- [ ] Driver có thể start simulation
- [ ] Parent có thể xem vị trí xe con

---

## 🆘 Troubleshooting

### Lỗi "Failed to fetch" hoặc "Network Error"
→ Kiểm tra URL có đúng không? Backend có đang chạy không?

### SignalR không kết nối được
→ Kiểm tra `GEOLOCATION_HUB_URL` và `NOTIFICATION_HUB_URL` có đúng không?

### API trả về 404
→ Kiểm tra `API_PREFIX` có đúng `/api/v1` không?

---

## 📞 Liên Hệ

Nếu có thắc mắc, liên hệ team phát triển!
