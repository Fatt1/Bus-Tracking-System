import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DashboardPage.css";
import { FaBus, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import MapComponent from "../components/MapComponent"; // Đảm bảo đường dẫn đúng

// Component nhỏ: Thẻ Tuyến Xe (Thêm onClick)
const RouteCard = ({ route, onClick }) => (
  // Thêm sự kiện onClick
  <div className="route-card" onClick={() => onClick(route)}>
    <div className="route-card-top">
      <div className="route-card-icon">
        <FaBus size={24} />
      </div>
      {/* API trả về routeName */}
      <h4>{route.routeName || "Tên Tuyến"}</h4>
    </div>
    <div className="route-card-bottom">
      {/* Hiển thị điểm đầu và cuối nếu có */}
      <p>
        {route.stopPoints && route.stopPoints.length > 0
          ? `${route.stopPoints[0].pointName} - ${
              route.stopPoints[route.stopPoints.length - 1].pointName
            }`
          : "Chưa có trạm"}
      </p>
      {/* API không có time, tạm ẩn */}
      {/* <span>{route.departureTime || "00:00"} - {route.arrivalTime || "00:00"}</span> */}
    </div>
  </div>
);

// Component chính của trang Dashboard
const DashboardPage = () => {
  const [allRoutes, setAllRoutes] = useState([]); // Lưu tất cả routes từ API
  const [startIndex, setStartIndex] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null); // State mới: lưu route đang được chọn
  const [isLoading, setIsLoading] = useState(true); // State loading
  const routesPerPage = 5;
  const totalRoutes = allRoutes.length;

  // Fetch tất cả routes khi component mount
  useEffect(() => {
    const getRoutes = async () => {
      setIsLoading(true);
      try {
        // Gọi API lấy tất cả routes (luôn trang 1, size lớn)
        const response = await axios.get(
          "https://localhost:7229/api/v1/route/all?PageNumber=1&PageSize=100" // Lấy nhiều để có đủ dữ liệu
        );
        console.log("Fetched routes:", response.data);
        const routesData = response.data.items || [];
        setAllRoutes(routesData);
        // Tự động chọn route đầu tiên để hiển thị trên bản đồ ban đầu (tùy chọn)
        if (routesData.length > 0) {
          setSelectedRoute(routesData[0]);
        }
      } catch (error) {
        console.error("Lỗi khi tải các tuyến đường:", error);
        alert("Không thể tải dữ liệu tuyến đường.");
        setAllRoutes([]); // Đặt mảng rỗng nếu lỗi
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
      // Lấy route từ allRoutes thay vì routes
      displayedRoutes.push(allRoutes[(startIndex + i) % totalRoutes]);
    }
  }
  // --- End Logic Slider ---

  // Hàm xử lý khi click vào RouteCard
  const handleRouteClick = (route) => {
    console.log("Route clicked:", route);
    setSelectedRoute(route); // Cập nhật state route đang chọn
  };

  return (
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
                  // Truyền hàm handleRouteClick vào onClick
                  <RouteCard
                    key={route.id + "-" + index}
                    route={route}
                    onClick={handleRouteClick} // Thêm onClick
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

      <section className="map-section">
        {/* Truyền selectedRoute xuống MapComponent */}
        {isLoading && !selectedRoute ? (
          <div className="map-placeholder">Đang tải dữ liệu bản đồ...</div>
        ) : // Chỉ render MapComponent khi có dữ liệu routes (ít nhất 1)
        allRoutes.length > 0 ? (
          <MapComponent selectedRoute={selectedRoute} />
        ) : (
          <div className="map-placeholder">
            Không có dữ liệu tuyến đường để hiển thị bản đồ.
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
