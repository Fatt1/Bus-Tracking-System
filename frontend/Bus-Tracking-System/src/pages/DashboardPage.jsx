// src/components/DashboardPage.jsx

import React, { useState } from "react";
import "./DashboardPage.css";
import {
  FaHome,
  FaBus,
  FaUserTie,
  FaRoute,
  FaUserGraduate,
  FaCommentDots,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// Dữ liệu mẫu
const sampleRoutes = [
  {
    id: 1,
    name: "Tuyến số 1",
    description: "Đường An Dương Vương",
    time: "4:00 - 6:00",
  },
  {
    id: 2,
    name: "Tuyến số 2",
    description: "Đường Nguyễn Văn Cừ",
    time: "4:15 - 6:15",
  },
  {
    id: 3,
    name: "Tuyến số 3",
    description: "Ký túc xá khu B",
    time: "4:30 - 6:30",
  },
  {
    id: 4,
    name: "Tuyến số 4",
    description: "Làng đại học",
    time: "4:45 - 6:45",
  },
  {
    id: 5,
    name: "Tuyến số 5",
    description: "Cầu Sài Gòn",
    time: "5:00 - 7:00",
  },
  {
    id: 6,
    name: "Tuyến số 6",
    description: "Bến xe Miền Tây",
    time: "5:15 - 7:15",
  },
  {
    id: 7,
    name: "Tuyến số 7",
    description: "Công viên 23/9",
    time: "5:30 - 7:30",
  },
  { id: 8, name: "Tuyến số 8", description: "Suối Tiên", time: "5:45 - 7:45" },
  {
    id: 9,
    name: "Tuyến số 9",
    description: "Chợ Bến Thành",
    time: "6:00 - 8:00",
  },
  {
    id: 10,
    name: "Tuyến số 10",
    description: "Nhà thờ Đức Bà",
    time: "6:15 - 8:15",
  },
];

// Component nhỏ: Thẻ Tuyến Xe (ĐÃ CẬP NHẬT CẤU TRÚC)
const RouteCard = ({ route }) => (
  <div className="route-card">
    <div className="route-card-top">
      <div className="route-card-icon">
        <FaBus size={24} />
      </div>
      <h4>{route.name}</h4>
    </div>
    <div className="route-card-bottom">
      <p>{route.description}</p>
      <span>{route.time}</span>
    </div>
  </div>
);

// Component: Thanh điều hướng bên trái
const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <h3>36 36 BUS BUS</h3>
    </div>
    <nav className="sidebar-nav">
      <ul>
        <li className="active">
          <a href="#">
            <FaHome /> Trang chủ
          </a>
        </li>
        <li>
          <a href="#">
            <FaBus /> Xe buýt
          </a>
        </li>
        <li>
          <a href="#">
            <FaUserTie /> Tài xế
          </a>
        </li>
        <li>
          <a href="#">
            <FaRoute /> Lịch trình xe
          </a>
        </li>
        <li>
          <a href="#">
            <FaUserGraduate /> Học sinh
          </a>
        </li>
        <li>
          <a href="#">
            <FaCommentDots /> Nhắn tin
          </a>
        </li>
      </ul>
    </nav>
  </aside>
);

// Component: Phần nội dung chính bên phải (ĐÃ CẬP NHẬT CẤU TRÚC)
const MainContent = () => {
  const [startIndex, setStartIndex] = useState(0);
  const routesPerPage = 5;
  const totalRoutes = sampleRoutes.length;

  const handlePrev = () => {
    setStartIndex((prevIndex) => (prevIndex - 1 + totalRoutes) % totalRoutes);
  };

  const handleNext = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % totalRoutes);
  };

  let displayedRoutes = [];
  for (let i = 0; i < routesPerPage; i++) {
    displayedRoutes.push(sampleRoutes[(startIndex + i) % totalRoutes]);
  }

  return (
    <main className="main-content">
      {/* Div mới để bọc header và routes-section */}
      <div className="main-content-top-wrapper">
        <header className="main-header">
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Trang chủ</span>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
            <button className="login-button">Đăng nhập</button>
          </div>
        </header>

        <section className="routes-section">
          <div className="routes-slider-container">
            <button className="arrow-button left" onClick={handlePrev}>
              <FaChevronLeft />
            </button>
            <div className="routes-slider">
              {displayedRoutes.map((route, index) => (
                <RouteCard key={route.id + "-" + index} route={route} />
              ))}
            </div>
            <button className="arrow-button right" onClick={handleNext}>
              <FaChevronRight />
            </button>
          </div>
        </section>
      </div>

      <section className="map-section">
        <div className="map-placeholder">Bản đồ sẽ được hiển thị ở đây</div>
      </section>
    </main>
  );
};

// Component chính: Trang Dashboard
const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default DashboardPage;
