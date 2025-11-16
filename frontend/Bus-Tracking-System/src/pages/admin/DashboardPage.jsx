import React, { useState, useEffect } from "react";
import api from "../../utils/api"; // Import api instance với withCredentials
import { useNavigate } from "react-router-dom";
import { getAuthRoles, clearAuth } from "../../utils/auth";
import "./DashboardPage.css"; // Sẽ cập nhật file này ở bước 3
import {
  FaBus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaPlayCircle,
} from "react-icons/fa"; // Thêm FaPlayCircle
import MapComponent from "../../components/MapComponent"; // Đảm bảo đường dẫn đúng
import { useTranslation } from "react-i18next"; // Import i18n hook
import LanguageSwitcher from "../../components/LanguageSwitcher"; // Import Language Switcher

// Component nhỏ: Thẻ Tuyến Xe (Thêm onClick và class active)
const RouteCard = ({ route, onClick, isSelected, t }) => (
  <div
    className={`route-card ${isSelected ? "selected" : ""}`}
    onClick={() => onClick(route)}
  >
    <div className="route-card-top">
      <div className="route-card-icon">
        <FaBus size={24} />
      </div>
      <h4>{route.routeName || t("admin.dashboard.routeName")}</h4>
    </div>
    <div className="route-card-bottom">
      <p>
        {route.stopPoints && route.stopPoints.length > 0
          ? `${route.stopPoints[0].pointName} - ${
              route.stopPoints[route.stopPoints.length - 1].pointName
            }`
          : t("admin.dashboard.noStops")}
      </p>
    </div>
  </div>
);

// Component chính của trang Dashboard
const DashboardPage = () => {
  const { t } = useTranslation(); // i18n hook
  const [allRoutes, setAllRoutes] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState(getAuthRoles());
  const navigate = useNavigate();

  // REMOVED: Admin chỉ xem realtime, không trigger animation
  // const [isAnimationTriggered, setIsAnimationTriggered] = useState(false);

  const routesPerPage = 5;
  const totalRoutes = allRoutes.length;

  // Toggle sidebar function for hamburger button
  const handleToggleSidebar = () => {
    if (window.toggleAdminSidebar) {
      window.toggleAdminSidebar();
    }
  };

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
        const errorMsg =
          error.response?.status === 401
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
    // REMOVED: Không cần trigger animation nữa
  };

  // REMOVED: Admin không được phép start simulation
  // Hàm callback khi animation kết thúc (giữ lại để tránh lỗi, nhưng không dùng)
  const onAnimationFinished = () => {
    console.log("DashboardPage: Animation finished callback (not used).");
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
          {/* Hamburger button for mobile */}
          <button 
            className="hamburger-button"
            onClick={handleToggleSidebar}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className="breadcrumbs">
            <span>{t("common.page")}</span> / <span>{t("admin.sidebar.dashboard")}</span>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder={t("common.search")} />
            </div>
            <LanguageSwitcher />
            {roles && roles.length > 0 ? (
              <button className="login-button" onClick={handleLogout}>
                {t("common.logout")}
              </button>
            ) : (
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                {t("common.login")}
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
                  {t("admin.dashboard.loadingRoutes")}
                </p>
              ) : displayedRoutes.length > 0 ? (
                displayedRoutes.map((route, index) => (
                  <RouteCard
                    key={route.id + "-" + index}
                    route={route}
                    onClick={handleRouteClick}
                    isSelected={selectedRoute && route.id === selectedRoute.id}
                    t={t}
                  />
                ))
              ) : (
                <p
                  style={{ color: "white", width: "100%", textAlign: "center" }}
                >
                  {t("admin.dashboard.noRoutes")}
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

      {/* REMOVED: Admin không được phép start simulation, chỉ xem realtime từ driver */}

      <section className="map-section">
        {allRoutes.length > 0 ? (
          <MapComponent
            selectedRoute={selectedRoute}
            isAnimationTriggered={false}
            onAnimationFinished={onAnimationFinished}
            listenOnly={true}
          />
        ) : (
          <div className="map-placeholder">
            {isLoading
              ? t("admin.dashboard.loadingMap")
              : t("admin.dashboard.noRouteData")}
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
