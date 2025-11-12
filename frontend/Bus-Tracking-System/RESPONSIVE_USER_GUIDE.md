# 📱 HƯỚNG DẪN SỬ DỤNG RESPONSIVE DESIGN

## Bus Tracking System - Responsive User Guide

---

## 🎯 CÁCH TEST RESPONSIVE DESIGN

### 1. **Sử dụng Chrome DevTools**

1. Mở ứng dụng: `http://localhost:5173`
2. Nhấn `F12` hoặc `Ctrl + Shift + I` để mở DevTools
3. Click icon **Toggle Device Toolbar** (hoặc `Ctrl + Shift + M`)
4. Chọn device:
   - **iPhone 12 Pro** (390x844)
   - **iPad Air** (820x1180)
   - **Desktop** (1920x1080)

### 2. **Test Các Breakpoints**

#### Mobile (< 768px):
- Sidebar: Ẩn, hiện hamburger menu
- Table: Chuyển sang card layout
- Header: Compact, hide search

#### Tablet (768px - 1024px):
- Sidebar: Icon-only (70px)
- Table: Vẫn hiển thị bình thường
- Header: Một số text bị ẩn

#### Desktop (> 1024px):
- Sidebar: Full width (240-260px)
- Table: Full display
- Header: Tất cả features visible

---

## 🎨 FEATURES ĐÃ IMPLEMENT

### ✅ **Hamburger Menu**

**Vị trí**: Góc trái header (chỉ hiện mobile < 768px)

**Cách dùng**:
1. Click hamburger icon (3 lines)
2. Sidebar slide in từ trái
3. Click outside hoặc click mục menu để đóng
4. Icon transform thành X khi mở

**Áp dụng cho**:
- Admin pages
- Driver pages  
- Parent pages

---

### ✅ **Table → Card Layout**

**Tự động chuyển đổi** khi màn hình < 768px

**Before (Desktop)**:
```
┌─────────────────────────────────┐
│ Table with columns              │
│ [ID] [Name] [Status] [Actions]  │
└─────────────────────────────────┘
```

**After (Mobile)**:
```
┌─────────────────┐
│ Card 1          │
│ Name: Bus 001   │
│ Status: Active  │
│ [Actions]       │
└─────────────────┘
┌─────────────────┐
│ Card 2          │
│ ...             │
└─────────────────┘
```

**Pages có feature này**:
- BusListPage
- StudentListPage (cần implement)
- DriverListPage (cần implement)

---

### ✅ **Responsive Sidebar**

#### Desktop Mode:
- Width: 240-260px
- Full text labels
- Fixed position

#### Tablet Mode (768-1024px):
- Width: 70px
- Icon-only
- Text bị ẩn hoặc hiển thị dạng vertical

#### Mobile Mode (< 768px):
- Hidden by default (left: -260px)
- Overlay khi mở (left: 0)
- Backdrop dim screen
- Click outside để đóng
- Auto-close khi navigate

---

### ✅ **Touch Optimization**

Tất cả buttons và clickable elements:
- **Min size**: 44x44px (theo Apple HIG)
- Padding tăng trên mobile
- Hover effects disabled on touch devices

---

### ✅ **Modal Responsive**

#### Desktop:
- Centered
- Fixed width (500px)
- Fade in animation

#### Mobile:
- Full width
- Slide up from bottom
- Border-radius top only
- Max-height: 90vh
- Scrollable content

---

## 🔧 CSS UTILITIES AVAILABLE

Bạn có thể dùng các class sau trong code:

### Hide/Show Elements:
```html
<!-- Hide on mobile -->
<div class="hide-mobile">Desktop only</div>

<!-- Show only on mobile -->
<div class="show-mobile">Mobile only</div>

<!-- Hide on tablet -->
<div class="hide-tablet">Hide on tablet</div>
```

### Responsive Layout:
```html
<!-- Stack vertically on mobile -->
<div class="flex-column-mobile">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Responsive grid -->
<div class="responsive-grid cols-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Spacing:
```html
<!-- Mobile-specific padding -->
<div class="p-mobile-2">Content</div>

<!-- Mobile-specific gap -->
<div class="gap-mobile-1">Items with gap</div>
```

---

## 🎮 KEYBOARD SHORTCUTS

- `Ctrl + Shift + M` - Toggle device toolbar (Chrome)
- `Ctrl + Shift + I` - Open DevTools
- `Esc` - Close modal/sidebar (nếu implement)

---

## 📱 TEST SCENARIOS

### Scenario 1: Login → Dashboard (Mobile)
1. Mở mobile view (390px width)
2. Login as Admin
3. Check hamburger menu hiện
4. Click hamburger → sidebar slide in
5. Click outside → sidebar slide out
6. Navigate to Bus List
7. Check table → card layout

### Scenario 2: Driver Schedule (Tablet)
1. Mở tablet view (820px width)
2. Login as Driver
3. Check sidebar icon-only (70px)
4. Navigate các pages
5. Check schedule cards layout
6. Test profile modal

### Scenario 3: Parent Tracking (Mobile Landscape)
1. Mở mobile view (844x390)
2. Login as Parent
3. Check landscape layout
4. Navigate to Map
5. Test fullscreen map (if implemented)

---

## 🐛 TROUBLESHOOTING

### Issue: Sidebar không mở trên mobile
**Fix**: 
- Check window.toggleAdminSidebar() có tồn tại không
- Check z-index của sidebar và overlay
- Clear cache và reload

### Issue: Table vẫn hiển thị trên mobile
**Fix**:
- Check media query `@media (max-width: 768px)`
- Verify `.table-container { display: none; }`
- Verify `.mobile-card-list { display: block; }`

### Issue: Hamburger menu không có animation
**Fix**:
- Check CSS transition được load
- Check class `active` được toggle
- Check không có `!important` conflict

### Issue: Modal không full-width trên mobile
**Fix**:
- Check `.modal-content` có `width: 100% !important` không
- Check parent `.modal-overlay` có align-items đúng không

---

## 📊 PERFORMANCE TIPS

### 1. **Tối ưu Images**
```css
img {
  max-width: 100%;
  height: auto;
}
```

### 2. **Lazy Load**
```jsx
<img loading="lazy" src="..." alt="..." />
```

### 3. **Reduce Motion**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎨 CUSTOMIZATION

### Thay đổi Breakpoints:

Edit `src/styles/responsive.css`:

```css
:root {
  --breakpoint-mobile: 768px;   /* Change this */
  --breakpoint-tablet: 1024px;  /* Change this */
}
```

### Thay đổi Sidebar Width:

```css
:root {
  --sidebar-width-desktop: 260px;  /* Desktop width */
  --sidebar-width-tablet: 70px;    /* Tablet width */
  --sidebar-width-mobile: 250px;   /* Mobile width */
}
```

---

## ✅ CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Test trên Chrome, Firefox, Safari
- [ ] Test trên iPhone (real device)
- [ ] Test trên Android (real device)
- [ ] Test portrait & landscape
- [ ] Test all breakpoints (390px, 768px, 1024px, 1920px)
- [ ] Test hamburger menu hoạt động
- [ ] Test table → card chuyển đổi
- [ ] Test modals responsive
- [ ] Test forms responsive
- [ ] Test touch targets (44px min)
- [ ] Check performance (Lighthouse)
- [ ] Check accessibility (WAVE tool)

---

## 🎓 LEARNING RESOURCES

### Responsive Design:
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [CSS-Tricks Complete Guide](https://css-tricks.com/guides/)

### Testing Tools:
- Chrome DevTools
- Firefox Responsive Design Mode
- BrowserStack (cross-browser testing)
- Lighthouse (performance)

---

## 💡 TIPS & TRICKS

### 1. Quick Mobile Test:
```
Ctrl + Shift + M → iPhone 12 Pro → Reload
```

### 2. Test Multiple Devices:
```
DevTools → Show Multiple Devices
```

### 3. Screenshot:
```
DevTools → Capture Screenshot (mobile view)
```

### 4. Network Throttling:
```
DevTools → Network → Throttling → Slow 3G
```

---

## 🚀 NEXT LEVEL

### Future Enhancements:
1. **PWA** - Installable app
2. **Offline Mode** - Service workers
3. **Dark Mode** - Theme switcher
4. **Gestures** - Swipe to navigate
5. **Animations** - Micro-interactions
6. **Accessibility** - ARIA labels, keyboard nav

---

## 📞 SUPPORT

Nếu có vấn đề hoặc câu hỏi:
1. Check console for errors (`F12` → Console)
2. Check network tab for failed requests
3. Clear cache: `Ctrl + Shift + Delete`
4. Hard reload: `Ctrl + F5`

---

**🎉 Chúc bạn code vui vẻ với responsive design mới!** 📱✨
