# COMPLETE I18N IMPLEMENTATION PLAN

## DANH SÁCH FILE CẦN DỊCH (TỔNG CỘNG 29+ FILES)

### ✅ ĐÃ HOÀN THÀNH TRƯỚC ĐÓ:

1. ✅ src/pages/DashboardPage.jsx - DONE
2. ✅ src/pages/LoginPage.jsx - DONE
3. ✅ src/components/SideBar.jsx - DONE
4. ✅ src/pages/driver/DriverHomePage.jsx - DONE (including inline components)
5. ✅ src/pages/parent/ParentHomePage.jsx - DONE
6. ✅ src/components/parent/ParentSidebar.jsx - DONE
7. ✅ src/components/parent/ParentHeader.jsx - DONE

### 🔴 CẦN DỊCH NGAY BÂY GIỜ:

#### A. ADMIN PAGES (11 files):

1. src/pages/BusListPage.jsx
2. src/pages/BusDetailPage.jsx
3. src/pages/DriverListPage.jsx
4. src/pages/StudentListPage.jsx
5. src/pages/RouteListPage.jsx
6. src/pages/ScheduleListPageNew.jsx
7. src/pages/ScheduleAddEditPageNew.jsx
8. src/pages/ScheduleHistoryPage.jsx
9. src/pages/NotificationPage.jsx
10. src/pages/MultiSelectDropdown.jsx
11. src/components/Layout.jsx (if has text)

#### B. DRIVER PAGES (4 files):

1. src/pages/driver/DriverStudentListPage.jsx
2. src/pages/driver/DriverSchedulePage.jsx
3. src/pages/driver/DriverNotificationPage.jsx
4. src/components/driver/ReportIncidentModal.jsx

#### C. PARENT PAGES (2 files):

1. src/pages/parent/ParentNotificationPage.jsx
2. src/pages/parent/ParentTrackingMapPage.jsx

#### D. COMMON COMPONENTS (2 files):

1. src/components/ToastContainer.jsx
2. src/components/MapComponent.jsx (if has text)

## CÁC BƯỚC THỰC HIỆN:

### STEP 1: ✅ TẠO TRANSLATION FILES HOÀN CHỈNH

- [x] Tạo src/locales/vi/translation.json với TOÀN BỘ keys
- [x] Tạo src/locales/en/translation.json với TOÀN BỘ keys

### STEP 2: DỊCH TỪNG NHÓM FILE

#### NHÓM A: ADMIN PAGES (Priority 1)

1. BusListPage.jsx + BusDetailPage.jsx (2 files liên quan)
2. DriverListPage.jsx
3. StudentListPage.jsx
4. RouteListPage.jsx
5. ScheduleListPageNew.jsx + ScheduleAddEditPageNew.jsx + ScheduleHistoryPage.jsx (3 files liên quan)
6. NotificationPage.jsx + MultiSelectDropdown.jsx (2 files liên quan)

#### NHÓM B: DRIVER PAGES (Priority 2)

1. DriverStudentListPage.jsx
2. DriverSchedulePage.jsx
3. DriverNotificationPage.jsx
4. ReportIncidentModal.jsx

#### NHÓM C: PARENT PAGES (Priority 3)

1. ParentNotificationPage.jsx
2. ParentTrackingMapPage.jsx

#### NHÓM D: COMMON COMPONENTS (Priority 4)

1. ToastContainer.jsx
2. MapComponent.jsx (nếu có text)

### STEP 3: TEST & VERIFY

- Test chuyển đổi ngôn ngữ trên TẤT CẢ các trang
- Verify không còn hardcoded text tiếng Việt nào
- Check console không còn warnings về missing keys

## ESTIMATE:

- Tổng số files: ~29 files
- Số dòng text cần dịch: ~500+ text strings
- Thời gian ước tính: 1-2 giờ để hoàn thành toàn bộ

## PROGRESS TRACKER:

- [ ] Translation JSON files created
- [ ] Admin pages translated (0/9)
- [ ] Driver pages translated (0/4)
- [ ] Parent pages translated (0/2)
- [ ] Common components translated (0/2)
- [ ] Final testing completed
