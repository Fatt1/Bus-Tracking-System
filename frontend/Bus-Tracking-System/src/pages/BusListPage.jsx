// src/pages/BusListPage.jsx

import React, { useState, useEffect } from "react"; // THAY ĐỔI 1: Thêm useEffect
import axios from "axios"; // THAY ĐỔI 2: Import axios
import "./BusListPage.css";
import busImg from "../assets/bus.png";
import {
  FaHome,
  FaBus,
  FaRoute,
  FaUserTie,
  FaUserGraduate,
  FaCommentDots,
} from "react-icons/fa";
import { SideBar } from "../components/SideBar";

// THAY ĐỔI 3: Xóa toàn bộ mảng dữ liệu mẫu `allBuses`.

// Component Card cho mỗi xe buýt (ĐÃ CẬP NHẬT để khớp với API)
const BusCard = ({ bus }) => (
  <div className="bus-card">
    <img src={busImg} alt={`Xe buýt ${bus.busName}`} />
    <div className="bus-card-info">
      <p>
        {/* API trả về busName, nhưng để "Xe: 001" thì dùng id */}
        <strong>Xe:</strong> {`00${bus.busName}`.slice(-3)}
      </p>
      <p>
        <strong>Biển số xe:</strong> {bus.plateNumber}
      </p>
      <p>
        <strong>Tài xế:</strong> {bus.driverName || "Chưa có"}{" "}
        {/* Hiển thị 'Chưa có' nếu driverName là null */}
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
);

// Component Phân trang (Giữ nguyên, không thay đổi)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Để tránh lỗi khi totalPages = 0 lúc đầu
  if (totalPages === 0) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination-container">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button onClick={() => onPageChange(currentPage - 1)}>&lt;</button>
        </li>
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? "active" : ""}`}
          >
            <button onClick={() => onPageChange(number)}>{number}</button>
          </li>
        ))}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button onClick={() => onPageChange(currentPage + 1)}>&gt;</button>
        </li>
      </ul>
    </nav>
  );
};

// Component chính của trang (ĐÃ CẬP NHẬT HOÀN TOÀN LOGIC)
const BusListPage = () => {
  // THAY ĐỔI 4: Quản lý state cho dữ liệu từ API
  const [buses, setBuses] = useState([]); // State để lưu danh sách xe buýt
  const [currentPage, setCurrentPage] = useState(1); // State cho trang hiện tại
  const [totalPages, setTotalPages] = useState(0); // State cho tổng số trang
  const [isLoading, setIsLoading] = useState(true); // State để hiển thị trạng thái tải
  const busesPerPage = 6; // Giữ nguyên số lượng xe mỗi trang

  // THAY ĐỔI 5: Sử dụng useEffect để gọi API mỗi khi `currentPage` thay đổi
  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true); // Bắt đầu tải, hiển thị loading
      try {
        // Thêm tham số `page` và `pageSize` vào URL để API biết cần lấy dữ liệu cho trang nào
        const response = await axios.get(
          `https://localhost:7229/api/v1/bus/all?page=${currentPage}&pageSize=${busesPerPage}`
        );
        // Cập nhật state với dữ liệu từ API
        setBuses(response.data.items);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xe buýt:", error);
        // Có thể thêm state để hiển thị lỗi ra giao diện
      } finally {
        setIsLoading(false); // Kết thúc tải
      }
    };

    fetchBuses();
  }, [currentPage]); // Hook này sẽ chạy lại mỗi khi `currentPage` thay đổi

  return (
    <div className="page-layout-container">
      <SideBar />
      <main className="main-content-area">
        <header className="page-header">
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Quản lý xe buýt</span> /{" "}
            <span>Danh sách xe buýt</span>
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
        <div className="page-banner">
          <h2>Danh sách xe buýt</h2>
        </div>

        <div className="page-content">
          {/* THAY ĐỔI 6: Hiển thị thông báo tải hoặc danh sách xe buýt */}
          {isLoading ? (
            <div className="loading-message">Đang tải dữ liệu...</div>
          ) : (
            <>
              <div className="bus-grid">
                {buses.map((bus) => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage} // Khi đổi trang, chỉ cần cập nhật state currentPage
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BusListPage;
