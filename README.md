# Hệ thống Theo dõi Xe buýt (Bus Tracking System)

## 1. Mô hình Yêu cầu (Requirements Model)

### 1.1. Bối cảnh

Dự án này nhằm xây dựng một hệ thống toàn diện để quản lý và theo dõi hoạt động của xe buýt đưa đón học sinh. Hệ thống cung cấp các chức năng cho ba nhóm người dùng chính: **Quản trị viên (Admin)**, **Tài xế (Driver)**, và **Phụ huynh (Parent)**.

### 1.2. Yêu cầu Chức năng (Functional Requirements)

#### a. Quản trị viên (Admin)

- **Quản lý Xe buýt:** Thêm, sửa, xóa, và xem danh sách xe buýt (tên xe, biển số, trạng thái).
- **Quản lý Tài xế:** Thêm, sửa, xóa, và xem danh sách tài xế (thông tin cá nhân, trạng thái).
- **Quản lý Học sinh:** Thêm, sửa, xóa, và xem danh sách học sinh (thông tin cá nhân, lớp, địa chỉ, thông tin phụ huynh).
- **Quản lý Tuyến đường:** Xem các tuyến đường và các điểm dừng trên mỗi tuyến.
- **Quản lý Lịch trình:**
  - Tạo lịch trình hàng ngày cho các tuyến, gán tài xế và xe buýt cụ thể.
  - Xem lịch trình dưới dạng lịch (calendar view).
  - Xem lịch sử các chuyến đi.
- **Gửi thông báo:** Gửi thông báo chung hoặc cho các nhóm người dùng cụ thể (tài xế, phụ huynh).
- **Dashboard:** Xem tổng quan về trạng thái hệ thống (số lượng xe, tài xế, học sinh, các chuyến đi đang hoạt động).

#### b. Tài xế (Driver)

- **Xem lịch trình:** Xem lịch trình được phân công trong ngày.
- **Điểm danh học sinh:** Ghi nhận trạng thái lên/xuống xe của học sinh tại các điểm dừng.
- **Xem danh sách học sinh:** Xem danh sách học sinh trên tuyến của mình.
- **Nhận thông báo:** Nhận thông báo từ quản trị viên.
- **Mô phỏng vị trí:** (Chức năng kỹ thuật) Bắt đầu/dừng việc gửi dữ liệu vị trí GPS của xe buýt.

#### c. Phụ huynh (Parent)

- **Theo dõi xe buýt:** Xem vị trí thời gian thực của xe buýt đang chở con mình trên bản đồ.
- **Xem lịch sử di chuyển:** Xem lại lịch sử các chuyến đi của con.
- **Nhận thông báo:** Nhận thông báo từ quản trị viên và các thông báo tự động

### 1.3. Yêu cầu Phi chức năng (Non-Functional Requirements)

- **Hiệu năng:** Hệ thống phải cập nhật vị trí xe buýt trong thời gian thực với độ trễ thấp.
- **Bảo mật:**
  - Phân quyền rõ ràng cho từng vai trò người dùng (Admin, Driver, Parent).
  - Dữ liệu người dùng phải được bảo vệ.
- **Khả năng mở rộng:** Kiến trúc hệ thống phải cho phép dễ dàng thêm các tính năng mới.
- **Giao diện người dùng:** Thân thiện, dễ sử dụng trên cả máy tính và thiết bị di động.

## 2. Thiết kế Hệ thống (System Design)

### 2.1. Sơ đồ Luồng Dữ liệu (Data Flow Diagram)

```
[Phụ huynh] --(Yêu cầu theo dõi)--> [Frontend] --(API Request)--> [Backend]
    ^                                                                   |
    |                                                                   v
(Vị trí xe) <-- [Frontend] <--(SignalR)---- [Backend] <--(Dữ liệu GPS)-- [Tài xế]
```

- **Luồng theo dõi xe:**
  1. **Tài xế** bắt đầu chuyến đi, ứng dụng của tài xế gửi dữ liệu vị trí (GPS) lên **Backend** thông qua API.
  2. **Backend** xử lý và lưu trữ vị trí, sau đó phát (broadcast) thông tin này đến các client đang kết nối qua **SignalR**.
  3. **Phụ huynh** mở trang theo dõi, **Frontend** nhận dữ liệu vị trí từ **SignalR** và cập nhật trên bản đồ.
- **Luồng quản lý:**
  1. **Admin** thực hiện các thao tác (quản lý xe, tài xế,...) trên **Frontend**.
  2. **Frontend** gửi các yêu cầu API (RESTful) đến **Backend**.
  3. **Backend** xử lý logic nghiệp vụ, tương tác với cơ sở dữ liệu và trả về kết quả.

### 2.2. Thiết kế Cơ sở dữ liệu (Database Design)

Hệ thống sử dụng cơ sở dữ liệu quan hệ với các thực thể chính sau:

- `AppUser`: Lưu trữ thông tin tài khoản cho tất cả người dùng, kế thừa từ `IdentityUser`.
- `Driver`, `Student`: Mở rộng thông tin chi tiết cho `AppUser`.
- `Bus`: Thông tin về xe buýt.
- `Route`, `StopPoint`: Định nghĩa các tuyến đường và điểm dừng.
- `Schedule`: Lịch trình di chuyển, liên kết `Bus`, `Driver`, và `Route`.
- `StudentCheckingHistory`: Ghi lại lịch sử điểm danh của học sinh.
- `Announcement`, `UserAnnouncement`: Quản lý thông báo.
- `BusLastLocation`: Lưu vị trí gần nhất của xe buýt.

## 3. Kiến trúc (Architecture)

Hệ thống được xây dựng dựa trên kiến trúc Microservices-like với hai thành phần chính: **Backend (.NET)** và **Frontend (React)**.

### 3.1. Backend (ASP.NET Core Web API)

Backend được xây dựng theo mô hình **Clean Architecture**, chia thành các project (lớp) riêng biệt:

- **`TrackingBusSystem.Domain`**:
  - Chứa các **Entities** (đối tượng nghiệp vụ cốt lõi) và **Interfaces** của Repository.
  - Không phụ thuộc vào bất kỳ lớp nào khác. Đây là trái tim của ứng dụng.
- **`TrackingBusSystem.Application`**:
  - Chứa logic nghiệp vụ (business logic) thông qua các **Features** (sử dụng mô hình CQRS với MediatR).
  - Định nghĩa các DTOs, mappers (AutoMapper), và các dịch vụ ứng dụng.
  - Phụ thuộc vào `Domain`.
- **`TrackingBusSystem.Infrastructure`**:
  - Cung cấp các triển khai cụ thể cho các interfaces đã định nghĩa ở `Application` và `Domain`.
  - **Repositories**: Triển khai truy vấn cơ sở dữ liệu bằng Entity Framework Core.
  - **Services**: Các dịch vụ bên ngoài
  - **Hubs**: Triển khai logic real-time với SignalR (`LocationHub`).
  - Phụ thuộc vào `Application`.
- **`TrackingBusSystem.Presentation`**:
  - Là điểm vào (entry point) của ứng dụng, chứa các **Controllers**.
  - Chịu trách nhiệm tiếp nhận HTTP request và gọi vào `Application` layer (thông qua MediatR) để xử lý.
  - Phụ thuộc vào `Application` và `Infrastructure`.

**Công nghệ sử dụng:**

- **Framework:** ASP.NET Core 8
- **ORM:** Entity Framework Core
- **Real-time:** SignalR
- **Mô hình:** Clean Architecture, CQRS với MediatR
- **Xác thực:** JWT (JSON Web Tokens)

### 3.2. Frontend (React)

Frontend là một ứng dụng Single Page Application (SPA) được xây dựng bằng React.

- **`src/pages`**: Chứa các trang chính của ứng dụng, được phân chia theo vai trò người dùng (`admin`, `driver`, `parent`).
- **`src/components`**: Chứa các thành phần UI tái sử dụng (Layout, MapComponent, ...).
- **`src/hooks`**: Chứa các custom hooks để quản lý logic phức tạp.
- **`src/context`**: Cung cấp state toàn cục cho ứng dụng.
- **`src/utils`**: Chứa các hàm tiện ích, bao gồm `axios` instance để gọi API và `BusSimulationManager` để mô phỏng GPS.
- **Routing:** Sử dụng `react-router-dom` để điều hướng và bảo vệ các route theo vai trò (`RequireRole` component).
- **Real-time:** Sử dụng `@microsoft/signalr` để kết nối với SignalR Hub ở backend và nhận dữ liệu vị trí.

**Công nghệ sử dụng:**

- **Thư viện:** React
- **Routing:** React Router
- **Gọi API:** Axios
- **UI Components:** Ant Design.
- **Bản đồ:** Leaflet và React-Leaflet
- **Build tool:** Vite
