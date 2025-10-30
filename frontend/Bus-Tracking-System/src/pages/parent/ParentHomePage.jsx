import React from "react";
import "./ParentHomePage.css";
import {
  FiHome,
  FiMapPin,
  FiAlertTriangle,
  FiBell,
  FiUser,
} from "react-icons/fi";

const ParentHomePage = () => {
  return (
    <div className="parent-home-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>36 36 BUS BUS</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <FiHome />
              <span>Trang chủ</span>
            </li>
            <li>
              <FiMapPin />
              <span>Vị trí xe</span>
            </li>
            <li>
              <FiAlertTriangle />
              <span>Báo cáo sự cố</span>
            </li>
            <li>
              <FiBell />
              <span>Thông báo</span>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="breadcrumbs">Trang / Trang chủ</div>
          <div className="header-right">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="search-bar"
            />
            <a href="#" className="login-link">
              Đăng nhập
            </a>
          </div>
        </header>

        <div className="main-body">
          <h1 className="welcome-title">CHÀO MỪNG !</h1>

          <div className="content-wrapper">
            {/* Schedule Card */}
            <div className="schedule-card">
              <h2>Lịch trình của con hôm nay</h2>
              <p className="date-subtitle">Thứ 2, Ngày 6 tháng 10 năm 2025</p>

              <div className="schedule-details">
                <div className="trip-info">
                  <h4>Thông tin chuyến đi</h4>
                  <p>
                    <strong>Tuyến:</strong> Nguyễn Hữu Thọ - Khánh Hội
                  </p>
                  <p>
                    <strong>Đón và trả học sinh tại:</strong> Trạm công viên
                    khánh hội
                  </p>
                </div>
                <div className="driver-info">
                  <h4>Thông tin tài xế và thời gian</h4>
                  <p>
                    <strong>Tài xế:</strong> A. Văn
                  </p>
                  <p>
                    <strong>Xe:</strong> Bus-001
                  </p>
                  <p>
                    <strong>Đi:</strong> 06:30
                  </p>
                  <p>
                    <strong>Về:</strong> 16:00
                  </p>
                </div>
              </div>

              <button className="track-button">Theo dõi vị trí xe buýt</button>
            </div>

            {/* Profile Info */}
            <div className="profile-info">
              <FiUser className="profile-icon" />
              <p className="profile-name">Phụ huynh: Phan Việt Huy</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentHomePage;
