import React, { useState, useEffect } from "react";
import api from "../utils/api"; // Import api instance với withCredentials
import { useNavigate } from "react-router-dom";
import { getAuthRoles, clearAuth } from "../utils/auth";
import "./DashboardPage.css"; // Sẽ cập nhật file này ở bước 3
import {
  FaBus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaPlayCircle,
} from "react-icons/fa"; // Thêm FaPlayCircle
import MapComponent from "../components/MapComponent"; // Đảm bảo đường dẫn đúng

// Component nhỏ: Thẻ Tuyến Xe (Thêm onClick và class active)
const RouteCard = ({ route, onClick, isSelected }) => (
  // Thêm class 'selected' nếu route này đang được chọn
  <div
    className={`route-card ${isSelected ? "selected" : ""}`}
    onClick={() => onClick(route)}
  >
    <div className="route-card-top">
      <div className="route-card-icon">
        <FaBus size={24} />
      </div>
      <h4>{route.routeName || "Tên Tuyến"}</h4>
    </div>
    <div className="route-card-bottom">
      <p>
        {route.stopPoints && route.stopPoints.length > 0
          ? `${route.stopPoints[0].pointName} - ${
              route.stopPoints[route.stopPoints.length - 1].pointName
            }`
          : "Chưa có trạm"}
      </p>
    </div>
  </div>
);

// Component chính của trang Dashboard
const DashboardPage = () => {
  const [allRoutes, setAllRoutes] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState(getAuthRoles());
  const navigate = useNavigate();

  // --- THÊM STATE MỚI ---
  // State này sẽ kích hoạt logic gửi data qua SignalR
  const [isAnimationTriggered, setIsAnimationTriggered] = useState(false);

  const routesPerPage = 5;
  const totalRoutes = allRoutes.length;

  // Fetch tất cả routes khi component mount
  useEffect(() => {
    const getRoutes = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/v1/route/all", {
          params: {
            PageNumber: 1,
            PageSize: 100,
          },
        });
        console.log("Fetched routes:", response.data);
        const routesData = response.data.items || [];
        setAllRoutes(routesData);
        if (routesData.length > 0) {
          // Tự động chọn route đầu tiên (chỉ hiển thị, không chạy)
          setSelectedRoute(routesData[0]);
        }
      } catch (error) {
        console.error("Lỗi khi tải các tuyến đường:", error);
        const errorMsg = error.response?.status === 401 
          ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          : "Không thể tải dữ liệu tuyến đường.";
        alert(errorMsg);
        setAllRoutes([]);
      } finally {
        setIsLoading(false);
      }
    };
    getRoutes();
  }, []); // Chỉ chạy 1 lần

  // --- Logic Slider (Giữ nguyên) ---
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
      displayedRoutes.push(allRoutes[(startIndex + i) % totalRoutes]);
    }
  }

  // --- CẬP NHẬT HÀM CLICK ---
  const handleRouteClick = (route) => {
    console.log("Route clicked:", route);
    setSelectedRoute(route);
    setIsAnimationTriggered(false); // Dừng trigger animation khi chọn route mới
  };

  // --- HÀM MỚI: KÍCH HOẠT ANIMATION ---
  const handleStartAnimation = () => {
    if (!selectedRoute) {
      alert("Vui lòng chọn một tuyến đường trước.");
      return;
    }
    console.log(`Triggering animation for route ${selectedRoute.id}`);
    setIsAnimationTriggered(true); // Kích hoạt
  };

  // Hàm callback khi animation kết thúc
  const onAnimationFinished = () => {
    console.log("DashboardPage: Animation finished, resetting trigger.");
    setIsAnimationTriggered(false);
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {
      // ignore errors on logout request
    } finally {
      clearAuth();
      setRoles([]);
      navigate("/login", { replace: true });
    }
  };

  return (
    <main className="main-content">
      <div className="main-content-top-wrapper">
        <header className="main-header">
          {/* ... (Giữ nguyên header) ... */}
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Trang chủ</span>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
            {roles && roles.length > 0 ? (
              <button className="login-button" onClick={handleLogout}>
                Đăng xuất
              </button>
            ) : (
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </header>

        <section className="routes-section">
          <div className="routes-slider-container">
            {/* ... (Nút slider giữ nguyên) ... */}
            <button
              className="arrow-button left"
              onClick={handlePrev}
              disabled={isLoading || totalRoutes <= routesPerPage}
            >
              <FaChevronLeft />
            </button>
            <div className="routes-slider">
              {isLoading && totalRoutes === 0 ? (
                <p
                  style={{ color: "white", width: "100%", textAlign: "center" }}
                >
                  Đang tải tuyến đường...
                </p>
              ) : displayedRoutes.length > 0 ? (
                displayedRoutes.map((route, index) => (
                  <RouteCard
                    key={route.id + "-" + index}
                    route={route}
                    onClick={handleRouteClick}
                    // So sánh ID để biết card nào đang được chọn
                    isSelected={selectedRoute && route.id === selectedRoute.id}
                  />
                ))
              ) : (
                <p
                  style={{ color: "white", width: "100%", textAlign: "center" }}
                >
                  Không có tuyến đường nào.
                </p>
              )}
            </div>
            <button
              className="arrow-button right"
              onClick={handleNext}
              disabled={isLoading || totalRoutes <= routesPerPage}
            >
              <FaChevronRight />
            </button>
          </div>
        </section>
      </div>

      {/* THÊM NÚT BẮT ĐẦU CHẠY */}
      <div className="map-controls">
        <button
          className="start-animation-btn"
          onClick={handleStartAnimation}
          disabled={isAnimationTriggered || !selectedRoute} // Vô hiệu hóa khi đang chạy
        >
          <FaPlayCircle />
          {isAnimationTriggered
            ? "Đang chạy..."
            : `Bắt đầu chạy tuyến ${selectedRoute ? selectedRoute.id : ""}`}
        </button>
      </div>

      <section className="map-section">
        {/* Truyền các props mới xuống MapComponent */}
        {allRoutes.length > 0 ? (
          <MapComponent
            selectedRoute={selectedRoute}
            isAnimationTriggered={isAnimationTriggered}
            onAnimationFinished={onAnimationFinished}
          />
        ) : (
          <div className="map-placeholder">
            {isLoading
              ? "Đang tải dữ liệu bản đồ..."
              : "Không có dữ liệu tuyến đường."}
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
