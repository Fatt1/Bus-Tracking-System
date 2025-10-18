import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./BusListPage.css";
import busImg from "../assets/bus.png";

// Component Card cho mỗi xe buýt (Giữ nguyên)
const BusCard = ({ bus }) => (
  <div className="bus-card">
    <img src={busImg} alt={`Xe buýt ${bus.busName}`} />
    <div className="bus-card-info">
      <p>
        <strong>Xe:</strong> {`00${bus.id}`.slice(-3)}
      </p>
      <p>
        <strong>Biển số xe:</strong> {bus.plateNumber}
      </p>
      <p>
        <strong>Tài xế:</strong> {bus.driverName || "Chưa có"}{" "}
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

// Component Phân trang (Giữ nguyên)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination-container">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
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
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};

// Component chính của trang
const BusListPage = () => {
  const [buses, setBuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const busesPerPage = 6;

  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://localhost:7229/api/v1/bus/all?page=${currentPage}&pageSize=${busesPerPage}`
        );
        setBuses(response.data.items);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu xe buýt:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuses();
  }, [currentPage]);

  // THAY ĐỔI: Bỏ thẻ div bao ngoài, trả về trực tiếp thẻ main
  return (
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
        {isLoading ? (
          <div className="loading-message">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="bus-grid">
              {buses.map((bus) => (
                <Link
                  to={`/bus/${bus.id}`}
                  key={bus.id}
                  className="bus-card-link"
                >
                  <BusCard bus={bus} />
                </Link>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default BusListPage;
