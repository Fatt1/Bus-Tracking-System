import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./BusDetailPage.css";
import busImg from "../assets/bus.png";
import { FaBus, FaAngleLeft } from "react-icons/fa";
import MapComponent from "../components/MapComponent"; // <-- 1. IMPORT MAP COMPONENT

// Component chính của trang
const BusDetailPage = () => {
  const { busId } = useParams();
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null); // <-- 2. THÊM STATE ĐỂ LƯU THÔNG TIN TUYẾN ĐƯỜNG
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusAndRouteDetails = async () => {
      try {
        // --- Lấy thông tin xe buýt ---
        // Giả sử API trả về danh sách
        const busResponse = await axios.get(
          `https://localhost:7229/api/v1/bus/all`
        );
        const allBuses = busResponse.data.items || [];
        const foundBus = allBuses.find((b) => b.id.toString() === busId);

        if (foundBus) {
          setBus(foundBus);

          // --- Lấy thông tin tuyến đường ---
          // Giả sử mỗi xe buýt có một `routeId`. Trong API của bạn chưa có,
          // nên tôi sẽ giả lập rằng busId 1 chạy routeId 1, busId 2 chạy routeId 2...
          // BẠN SẼ CẦN THAY THẾ LOGIC NÀY BẰNG API THẬT
          const routeId = foundBus.id;
          const routeResponse = await axios.get(
            "https://localhost:7229/api/v1/route/all"
          );
          const allRoutes = routeResponse.data.items || [];
          const foundRoute = allRoutes.find((r) => r.id === routeId);

          if (foundRoute) {
            setRoute(foundRoute);
          } else {
            // Vẫn hiển thị thông tin xe dù không có tuyến
            console.warn(`Không tìm thấy tuyến đường cho xe buýt ID: ${busId}`);
          }
        } else {
          setError("Không tìm thấy thông tin xe buýt.");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusAndRouteDetails();
  }, [busId]);

  if (loading) {
    return (
      <main className="main-content-area">
        <div className="detail-loading">Đang tải chi tiết xe...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content-area">
        <div className="detail-error">{error}</div>
      </main>
    );
  }

  if (!bus) {
    return (
      <main className="main-content-area">
        <div className="detail-error">Không có dữ liệu để hiển thị.</div>
      </main>
    );
  }

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <Link to="/bus" className="back-link">
            <FaAngleLeft /> Danh sách xe buýt
          </Link>
          / <span>Chi tiết xe {bus.busName}</span>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="search-input"
          />
          <button className="user-button">Đăng nhập</button>
        </div>
      </header>

      <div className="page-content detail-page-content">
        <div className="bus-detail-card">
          <div className="bus-detail-image">
            <img src={busImg} alt={`Xe buýt ${bus.busName}`} />
          </div>
          <div className="bus-detail-info">
            <h3>Xe: {`00${bus.id}`.slice(-3)}</h3>
            <p>
              <strong>Biển số xe:</strong> {bus.plateNumber}
            </p>
            <p>
              <strong>Tài xế:</strong> {bus.driverName || "Chưa phân công"}
            </p>
            <div className="bus-status">
              <strong>Trạng thái:</strong>{" "}
              {bus.status ? "Đang hoạt động" : "Không hoạt động"}
              <span
                className={`status-dot ${bus.status ? "active" : "inactive"}`}
              ></span>
            </div>
          </div>
        </div>

        {/* Hiển thị banner tuyến đường nếu có thông tin */}
        {route && (
          <div className="route-info-banner">
            <FaBus className="route-bus-icon" />
            <div className="route-info-text">
              <h4>Tuyến đường: {route.routeName}</h4>
              <p>
                {route.startLocation} - {route.endLocation}
              </p>
            </div>
          </div>
        )}

        {/* 3. THAY THẾ PLACEHOLDER BẰNG MAP COMPONENT */}
        <div className="map-container-detail">
          {route ? (
            // Truyền mảng chỉ chứa 1 tuyến đường vào MapComponent
            <MapComponent routes={[route]} />
          ) : (
            <div className="map-placeholder-detail">
              Không có dữ liệu lộ trình để hiển thị bản đồ.
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default BusDetailPage;
