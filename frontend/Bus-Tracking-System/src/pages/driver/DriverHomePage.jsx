import React, { useState } from "react";
import "./DriverHomePage.css";
import {
  FaHome,
  FaTasks,
  FaUserCheck,
  FaBell,
  FaExclamationTriangle,
  FaWrench,
  FaCarCrash,
  FaFirstAid,
  FaEllipsisH,
  FaTimes,
  FaBus,
  FaMapMarkedAlt,
  FaCalendarAlt, // Thêm icon lịch
} from "react-icons/fa";
import { Link } from "react-router";

// --- DỮ LIỆU MẪU CHO TÀI XẾ (SAU NÀY SẼ LẤY TỪ API) ---
const mockDriverProfile = {
  firstName: "Phan Viết",
  lastName: "Huy",
  avatarUrl: "https://i.pravatar.cc/150?u=driver1",
  birthDate: "2005-03-10", // Format YYYY-MM-DD
  gender: "Nam", // "Nam" hoặc "Nữ"
  phone: "0987654321",
  email: "huy@gmail.com",
  address: "196 Hoàng Diệu Phường 8 Quận 4 TPHCM",
};

// --- COMPONENT MODAL BÁO CÁO SỰ CỐ (Giữ nguyên) ---
const ReportIncidentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const handleOptionClick = (option) => {
    console.log("Đã chọn:", option);
    onClose();
  };
  return (
    <div className="driver-modal-overlay" onClick={onClose}>
      <div
        className="driver-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="driver-modal-close-btn" onClick={onClose}>
          {" "}
          <FaTimes />{" "}
        </button>
        <div className="incident-options-list">
          <button
            className="incident-option"
            onClick={() => handleOptionClick("technical")}
          >
            <FaWrench size={24} />{" "}
            <span>Sự cố kỹ thuật (Hỏng hóc, xịt lốp)</span>
          </button>
          <button
            className="incident-option"
            onClick={() => handleOptionClick("traffic")}
          >
            <FaCarCrash size={24} />{" "}
            <span>Sự cố giao thông (Kẹt xe, tai nạn nhỏ)</span>
          </button>
          <button
            className="incident-option"
            onClick={() => handleOptionClick("medical")}
          >
            <FaFirstAid size={24} /> <span>Khẩn cấp y tế (Học sinh bị ốm)</span>
          </button>
          <button
            className="incident-option"
            onClick={() => handleOptionClick("other")}
          >
            <FaEllipsisH size={24} /> <span>Khác</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT MODAL THÔNG TIN CÁ NHÂN (MỚI) ---
const DriverProfileModal = ({ isOpen, onClose, driver }) => {
  if (!isOpen) return null;

  // Giả lập, sau này sẽ là form cho phép chỉnh sửa
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Đã xác nhận (chưa có chức năng sửa)");
    onClose();
  };

  return (
    <div className="driver-modal-overlay" onClick={onClose}>
      <div
        className="driver-modal-content profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="driver-modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Cột trái: Avatar và Tên */}
          <div className="profile-left-column">
            <img
              src={driver.avatarUrl}
              alt="Avatar"
              className="profile-avatar-large"
            />
            <h3>{`${driver.firstName} ${driver.lastName}`}</h3>
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div className="profile-right-column">
            <section className="profile-section">
              <h4>Thông tin cá nhân</h4>
              <div className="form-group">
                <label htmlFor="fullName">Họ tên</label>
                <input
                  type="text"
                  id="fullName"
                  value={`${driver.firstName} ${driver.lastName}`}
                  readOnly
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="birthDate">Ngày sinh</label>
                  {/* Hiển thị ngày sinh đã format, input date hơi xấu */}
                  <div className="date-input-with-icon">
                    <input
                      type="text"
                      id="birthDate"
                      value={driver.birthDate.split("-").reverse().join("/")}
                      readOnly
                    />
                    <FaCalendarAlt className="icon" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <div className="gender-options">
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Nam"
                        checked={driver.gender === "Nam"}
                        readOnly
                      />{" "}
                      Nam
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Nữ"
                        checked={driver.gender === "Nữ"}
                        readOnly
                      />{" "}
                      Nữ
                    </label>
                    {/* <label>
                                            <input type="radio" name="gender" value="Khác" checked={driver.gender === 'Khác'} readOnly /> Khác
                                        </label> */}
                  </div>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h4>Thông tin liên hệ & địa chỉ</h4>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input type="text" id="phone" value={driver.phone} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="text" id="email" value={driver.email} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
                <input
                  type="text"
                  id="address"
                  value={driver.address}
                  readOnly
                />
              </div>
            </section>
          </div>

          {/* Nút bấm (nằm ngoài 2 cột) */}
          <div className="profile-form-actions">
            <button
              type="button"
              className="action-btn-form cancel-btn"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="action-btn-form confirm-btn">
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT SIDEBAR CỦA TÀI XẾ (Giữ nguyên) ---
const DriverSidebar = () => {
  // Đặt trang này là active
  const activePage = "home";

  return (
    <aside className="driver-sidebar">
      <div className="driver-sidebar-header">
        <h3>36 36 BUS BUS</h3>
      </div>
      <nav className="driver-sidebar-nav">
        <ul>
          <li className={activePage === "home" ? "active" : ""}>
            {/* Sửa <a> thành <Link> */}
            <Link to="/driver/home">
              {" "}
              <FaHome /> Trang chủ{" "}
            </Link>
          </li>
          <li className={activePage === "schedule" ? "active" : ""}>
            {/* Sửa <a> thành <Link> và thêm path */}
            <Link to="/driver/schedule">
              {" "}
              <FaTasks /> Lịch trình làm việc{" "}
            </Link>
          </li>
          <li className={activePage === "students" ? "active" : ""}>
            {/* Sửa <a> thành <Link> */}
            <Link to="#">
              {" "}
              <FaUserCheck /> Học sinh & điểm đón{" "}
            </Link>
          </li>
          <li className={activePage === "notifications" ? "active" : ""}>
            {/* Sửa <a> thành <Link> */}
            <Link to="/driver/notifications">
              {" "}
              <FaBell /> Thông báo{" "}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

// --- COMPONENT HEADER CỦA TÀI XẾ (Cập nhật: Thêm onProfileClick) ---
const DriverHeader = ({
  onReportIncident,
  onProfileClick,
  driverName = "Phan Viết Huy",
}) => {
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>Trang</span> / <span>Trang chủ</span>
      </div>
      <div className="driver-header-actions">
        <button className="report-incident-btn" onClick={onReportIncident}>
          <FaExclamationTriangle />
          <span>Báo cáo sự cố</span>
        </button>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="driver-search-input"
        />
        {/* Thêm onClick vào đây */}
        <div
          className="driver-user-info"
          onClick={onProfileClick}
          title="Xem thông tin cá nhân"
        >
          <img src="https://i.pravatar.cc/40?u=driver1" alt="Avatar" />
          <span>{driverName}</span>
        </div>
      </div>
    </header>
  );
};

// --- COMPONENT CHÍNH TRANG CHỦ TÀI XẾ (Cập nhật: Thêm state và render modal) ---
const DriverHomePage = () => {
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // <-- STATE MỚI

  return (
    <div className="driver-page-container">
      {/* Modal báo cáo sự cố */}
      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
      />

      {/* Modal thông tin cá nhân (MỚI) */}
      <DriverProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        driver={mockDriverProfile} // Truyền dữ liệu mẫu
      />

      {/* Sidebar */}
      <DriverSidebar />

      {/* Khu vực nội dung chính */}
      <div className="driver-main-wrapper">
        <DriverHeader
          onReportIncident={() => setIsIncidentModalOpen(true)}
          onProfileClick={() => setIsProfileModalOpen(true)} // <-- Thêm prop
          driverName={`${mockDriverProfile.firstName} ${mockDriverProfile.lastName}`} // Lấy tên từ data
        />

        <main className="driver-main-content">
          {/* Phần trên: Thông tin tài xế và Lời chào */}
          <section className="driver-welcome-section">
            <div className="driver-info-card">
              <img src={mockDriverProfile.avatarUrl} alt="Driver Avatar" />
              <div className="driver-details">
                <p>Tài xế:</p>
                <h3>{`${mockDriverProfile.firstName} ${mockDriverProfile.lastName}`}</h3>
                <span>
                  Xe buýt phụ trách: <strong>001</strong>
                </span>
              </div>
            </div>
            <div className="driver-greeting-card">
              <p>
                Buổi sáng tốt lành,{" "}
                <strong>
                  {mockDriverProfile.firstName} {mockDriverProfile.lastName}
                </strong>
                ! Hôm nay bạn có <strong>2 chuyến xe</strong> - bắt đầu lúc{" "}
                <strong>6:00 sáng</strong>. Chúc bạn một hành trình an toàn!
              </p>
            </div>
          </section>

          {/* Phần dưới: Lịch trình và Bản đồ (Giữ nguyên) */}
          <section className="driver-schedule-section">
            <div className="schedule-list">
              <h4>Lịch trình hôm nay</h4>
              <p className="schedule-date">Thứ 2, Ngày 6 tháng 10 năm 2025</p>

              <div className="schedule-card morning-card">
                {/* ... (code chuyến đi giữ nguyên) ... */}
                <div className="schedule-card-icon">
                  <FaBus size={24} />
                </div>
                <div className="schedule-card-info">
                  <h4>Tuyến số 1</h4>
                  <p>Đường An Dương Vương</p>
                  <span>4:00 - 6:00</span>
                </div>
                <div className="schedule-card-details">
                  <h3>Chuyến đi</h3>
                  <p>
                    Trạng thái:{" "}
                    <span className="status-upcoming">Sắp khởi hành</span>
                  </p>
                  <p>Số học sinh cần đón: 40</p>
                </div>
                <button className="start-trip-btn active-btn">
                  Bắt đầu chuyến đi
                </button>
              </div>

              <div className="schedule-card afternoon-card">
                {/* ... (code chuyến về giữ nguyên) ... */}
                <div className="schedule-card-icon">
                  <FaBus size={24} />
                </div>
                <div className="schedule-card-info">
                  <h4>Tuyến số 1</h4>
                  <p>Đường An Dương Vương</p>
                  <span>4:00 - 6:00</span>
                </div>
                <div className="schedule-card-details">
                  <h3>Chuyến về</h3>
                  <p>
                    Trạng thái: <span className="status-waiting">Đang chờ</span>
                  </p>
                  <p>Số học sinh cần đưa về: 40</p>
                </div>
                <button className="start-trip-btn disabled-btn" disabled>
                  Bắt đầu chuyến đi
                </button>
              </div>
            </div>

            <div className="driver-map-container">
              <div className="driver-map-placeholder">
                <FaMapMarkedAlt size={50} />
                <span>Bản đồ sẽ hiển thị ở đây</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DriverHomePage;
