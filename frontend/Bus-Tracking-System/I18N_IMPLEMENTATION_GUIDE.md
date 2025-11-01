# 🌍 Hướng dẫn sử dụng i18n (Đa ngôn ngữ) trong dự án

## ✅ Đã cài đặt xong:

1. ✅ react-i18next đã được cài đặt
2. ✅ File cấu hình `i18n.js` đã được tạo
3. ✅ Translation files (VI/EN) đã được tạo
4. ✅ LanguageSwitcher component đã được tạo
5. ✅ i18n đã được import vào `main.jsx`

## 📝 Cách sử dụng trong component/page:

### 1. Import hook useTranslation:

```jsx
import { useTranslation } from 'react-i18next';
```

### 2. Sử dụng hook trong component:

```jsx
const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('admin.dashboard.title')}</p>
    </div>
  );
};
```

### 3. Thêm LanguageSwitcher vào header:

```jsx
import LanguageSwitcher from '../components/LanguageSwitcher';

const Header = () => {
  return (
    <header>
      <div>Logo</div>
      <LanguageSwitcher /> {/* Nút chuyển đổi ngôn ngữ */}
      <button>Logout</button>
    </header>
  );
};
```

## 📚 Cấu trúc Translation Keys:

### Common (Dùng chung):
- `common.search` - "Tìm kiếm..." / "Search..."
- `common.login` - "Đăng nhập" / "Login"
- `common.logout` - "Đăng xuất" / "Logout"
- `common.loading` - "Đang tải..." / "Loading..."

### Admin:
- `admin.sidebar.dashboard` - "Bảng điều khiển" / "Dashboard"
- `admin.dashboard.title` - "Trang chủ" / "Dashboard"
- `admin.bus.title` - "Danh sách xe buýt" / "Bus List"

### Driver:
- `driver.sidebar.home` - "Trang chủ" / "Home"
- `driver.home.welcome` - "Chào mừng!" / "Welcome!"
- `driver.home.scheduleToday` - "Lịch trình hôm nay" / "Today's Schedule"

### Parent:
- `parent.sidebar.home` - "Trang chủ" / "Home"
- `parent.home.childSchedule` - "Lịch trình của con hôm nay" / "Your child's schedule today"

## 🔧 Ví dụ áp dụng cho từng loại trang:

### Admin - DashboardPage (✅ Đã hoàn thành):
```jsx
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const DashboardPage = () => {
  const { t } = useTranslation();
  
  return (
    <main>
      <header>
        <div className="breadcrumbs">
          <span>{t('common.page')}</span> / <span>{t('common.home')}</span>
        </div>
        <div className="header-actions">
          <input type="text" placeholder={t('common.search')} />
          <LanguageSwitcher />
          <button>{t('common.logout')}</button>
        </div>
      </header>
      
      <h1>{t('admin.dashboard.title')}</h1>
      <button>{t('admin.dashboard.startSimulation')}</button>
    </main>
  );
};
```

### Driver - DriverHomePage (Cần áp dụng):
```jsx
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const DriverHomePage = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <DriverHeader 
        reportButtonText={t('driver.home.reportIncident')}
        // ... other props
      />
      
      <main>
        <h1>{t('driver.home.welcome')}</h1>
        <p>{t('driver.home.scheduleToday')}</p>
        <button>{t('driver.home.startPickup')}</button>
        <button>{t('driver.home.startDropoff')}</button>
      </main>
    </div>
  );
};
```

### Parent - ParentHomePage (Cần áp dụng):
```jsx
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const ParentHomePage = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <ParentHeader />
      
      <main>
        <h1>{t('parent.home.welcome')}</h1>
        <h2>{t('parent.home.childSchedule')}</h2>
        <button>{t('parent.home.trackBus')}</button>
      </main>
    </div>
  );
};
```

## 🔄 Sidebar Components:

### Admin Sidebar (✅ Đã hoàn thành):
```jsx
import { useTranslation } from 'react-i18next';

export function SideBar() {
  const { t } = useTranslation();
  
  return (
    <aside>
      <nav>
        <ul>
          <li><Link to="/">{t('admin.sidebar.dashboard')}</Link></li>
          <li><Link to="/bus">{t('admin.sidebar.buses')}</Link></li>
          <li><Link to="/drivers">{t('admin.sidebar.drivers')}</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
```

### Driver Sidebar (Cần áp dụng):
```jsx
import { useTranslation } from 'react-i18next';

const DriverSidebar = () => {
  const { t } = useTranslation();
  
  return (
    <aside>
      <nav>
        <ul>
          <li><Link to="/driver/home">{t('driver.sidebar.home')}</Link></li>
          <li><Link to="/driver/schedule">{t('driver.sidebar.schedule')}</Link></li>
          <li><Link to="/driver/students">{t('driver.sidebar.students')}</Link></li>
        </ul>
      </nav>
    </aside>
  );
};
```

### Parent Sidebar (Cần áp dụng):
```jsx
import { useTranslation } from 'react-i18next';

const ParentSidebar = () => {
  const { t } = useTranslation();
  
  return (
    <aside>
      <nav>
        <ul>
          <li><Link to="/parent/home">{t('parent.sidebar.home')}</Link></li>
          <li><Link to="/parent/tracking">{t('parent.sidebar.tracking')}</Link></li>
          <li><Link to="/parent/notifications">{t('parent.sidebar.notifications')}</Link></li>
        </ul>
      </nav>
    </aside>
  );
};
```

## 📋 Danh sách pages cần áp dụng:

### ✅ Đã hoàn thành:
- [x] DashboardPage.jsx (Admin)
- [x] SideBar.jsx (Admin)

### ⏳ Cần làm tiếp (copy pattern từ DashboardPage):

**Admin Pages:**
- [ ] BusListPage.jsx
- [ ] BusDetailPage.jsx
- [ ] ScheduleListPageNew.jsx
- [ ] ScheduleAddEditPageNew.jsx
- [ ] StudentListPage.jsx
- [ ] DriverListPage.jsx
- [ ] RouteListPage.jsx
- [ ] NotificationPage.jsx

**Driver Pages:**
- [ ] DriverHomePage.jsx
- [ ] DriverSchedulePage.jsx
- [ ] DriverStudentListPage.jsx
- [ ] DriverNotificationPage.jsx
- [ ] components/driver/DriverMapComponent.jsx (nếu có text)
- [ ] components/driver/ReportIncidentModal.jsx (nếu có text)

**Parent Pages:**
- [ ] ParentHomePage.jsx
- [ ] ParentTrackingMapPage.jsx
- [ ] ParentNotificationPage.jsx
- [ ] components/parent/ParentHeader.jsx
- [ ] components/parent/ParentSidebar.jsx

**Other:**
- [ ] LoginPage.jsx

## 🎯 Pattern áp dụng nhanh:

1. **Import hook ở đầu file:**
   ```jsx
   import { useTranslation } from 'react-i18next';
   import LanguageSwitcher from '../components/LanguageSwitcher'; // hoặc '../../components/LanguageSwitcher'
   ```

2. **Sử dụng hook trong component:**
   ```jsx
   const MyPage = () => {
     const { t } = useTranslation();
     // ... rest of code
   }
   ```

3. **Thay text cứng bằng t():**
   - Trước: `<h1>Trang chủ</h1>`
   - Sau: `<h1>{t('admin.dashboard.title')}</h1>`

4. **Thêm LanguageSwitcher vào header:**
   ```jsx
   <header>
     {/* ... existing code ... */}
     <LanguageSwitcher />
     {/* ... buttons ... */}
   </header>
   ```

## 🔑 Thêm translation key mới:

Nếu cần thêm text mới, edit 2 files:
1. `src/locales/vi/translation.json` - Thêm tiếng Việt
2. `src/locales/en/translation.json` - Thêm tiếng Anh

Ví dụ thêm key mới:
```json
// vi/translation.json
{
  "driver": {
    "home": {
      "newKey": "Text tiếng Việt"
    }
  }
}

// en/translation.json
{
  "driver": {
    "home": {
      "newKey": "English text"
    }
  }
}
```

Sử dụng: `{t('driver.home.newKey')}`

## 🚀 Test ngay:

1. Chạy app: `npm run dev`
2. Mở trang Dashboard (Admin)
3. Click nút VI/EN ở header
4. Tất cả text sẽ đổi ngay lập tức!
5. Refresh page → ngôn ngữ vẫn được giữ (localStorage)

---

**LƯU Ý**: 
- Ngôn ngữ được lưu trong `localStorage` với key `language`
- Khi đổi ngôn ngữ, TẤT CẢ component đang dùng `useTranslation()` sẽ tự động re-render
- Không cần reload page, không cần prop drilling
- LanguageSwitcher có thể đặt ở bất kỳ đâu (header, sidebar, footer...)
