import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./BusDetailPage.css"; // Sẽ tạo ở bước 3
import busImg from "../assets/bus.png";
import { FaBus, FaAngleLeft } from "react-icons/fa";

// Component chính của trang
const BusDetailPage = () => {
  // useParams() là hook của React Router để lấy tham số từ URL (ví dụ: busId)
  const { busId } = useParams();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        // Giả lập API endpoint để lấy chi tiết một xe.
        // Bạn cần thay thế bằng API thật của mình, ví dụ: `.../api/v1/bus/${busId}`
        const response = await axios.get(
          `https://localhost:7229/api/v1/bus/all`
        );

        // Vì API của bạn không có endpoint chi tiết, tôi sẽ tìm xe trong danh sách
        const allBuses = response.data.items || [];
        const foundBus = allBuses.find((b) => b.id.toString() === busId);

        if (foundBus) {
          setBus(foundBus);
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

    fetchBusDetails();
  }, [busId]); // useEffect sẽ chạy lại nếu busId trên URL thay đổi

  if (loading) {
    return <div className="detail-loading">Đang tải chi tiết xe...</div>;
  }

  if (error) {
    return <div className="detail-error">{error}</div>;
  }

  if (!bus) {
    return <div className="detail-error">Không có dữ liệu để hiển thị.</div>;
  }

  return (
    // Component này sẽ được render bởi Outlet trong Layout
    // nên nó cũng sẽ có Sidebar
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          {/* Link để quay lại trang danh sách */}
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

        <div className="route-info-banner">
          <FaBus className="route-bus-icon" />
          <div className="route-info-text">
            <h4>Tuyến đường: An Dương Vương - Trần Hưng Đạo</h4>
            <p>Dừng tại: Trường Đại Học An Dư, Cin. Cộng Hoà</p>
          </div>
        </div>

        <div className="map-placeholder-detail">
          Bản đồ chi tiết lộ trình sẽ được hiển thị ở đây
        </div>
      </div>
    </main>
  );
};

export default BusDetailPage;
