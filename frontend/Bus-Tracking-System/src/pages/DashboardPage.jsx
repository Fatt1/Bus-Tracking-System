import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DashboardPage.css";
import { FaBus, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import MapComponent from "../components/MapComponent";

// Component nhỏ: Thẻ Tuyến Xe
const RouteCard = ({ route }) => (
  <div className="route-card">
    <div className="route-card-top">
      <div className="route-card-icon">
        <FaBus size={24} />
      </div>
      {/* Cập nhật để khớp với API (tên trường có thể khác) */}
      <h4>{route.routeName || "Tên Tuyến"}</h4>
    </div>
    <div className="route-card-bottom">
      <p>
        {route.startLocation || "Điểm đi"} - {route.endLocation || "Điểm đến"}
      </p>
      <span>
        {route.departureTime || "00:00"} - {route.arrivalTime || "00:00"}
      </span>
    </div>
  </div>
);

// Component chính của trang Dashboard
const DashboardPage = () => {
  const [routes, setRoutes] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const routesPerPage = 5;
  const totalRoutes = routes.length;

  useEffect(() => {
    const getHomeData = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7229/api/v1/route/all"
        );
        setRoutes(response.data.items || response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải các tuyến đường:", error);
      }
    };
    getHomeData();
  }, []); // Chỉ chạy 1 lần

  const handlePrev = () => {
    if (totalRoutes === 0) return;
    setStartIndex((prev) => (prev - 1 + totalRoutes) % totalRoutes);
  };

  const handleNext = () => {
    if (totalRoutes === 0) return;
    setStartIndex((prev) => (prev + 1) % totalRoutes);
  };

  let displayedRoutes = [];
  if (totalRoutes > 0) {
    for (let i = 0; i < routesPerPage; i++) {
      displayedRoutes.push(routes[(startIndex + i) % totalRoutes]);
    }
  }

  return (
    // Component này giờ chỉ là phần nội dung chính
    <main className="main-content">
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
            <button
              className="arrow-button left"
              onClick={handlePrev}
              disabled={!totalRoutes}
            >
              <FaChevronLeft />
            </button>
            <div className="routes-slider">
              {displayedRoutes.length > 0 ? (
                displayedRoutes.map((route, index) => (
                  <RouteCard key={route.id + "-" + index} route={route} />
                ))
              ) : (
                <p style={{ color: "white" }}>
                  Đang tải hoặc không có tuyến đường nào...
                </p>
              )}
            </div>
            <button
              className="arrow-button right"
              onClick={handleNext}
              disabled={!totalRoutes}
            >
              <FaChevronRight />
            </button>
          </div>
        </section>
      </div>

      <section className="map-section">
        {/* Truyền dữ liệu 'routes' vào component bản đồ */}
        {routes.length > 0 ? (
          <MapComponent routes={routes} />
        ) : (
          <div className="map-placeholder">Đang tải dữ liệu bản đồ...</div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
