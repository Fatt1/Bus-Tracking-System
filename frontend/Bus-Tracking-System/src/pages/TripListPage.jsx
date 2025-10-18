import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./TripListPage.css"; // Sẽ tạo ở bước sau
import { FaCalendarAlt, FaPen, FaMinusCircle } from "react-icons/fa";

// --- DEMO DATA ---
const allTrips = Array.from({ length: 18 }, (_, i) => {
  const drivers = ["Phan Viết Huy", "Trần Văn Bảo", "Lê Thị Cẩm"];
  const routes = [
    "An Dương Vương - Nguyễn Trãi",
    "Bến Thành - Suối Tiên",
    "Quận 1 - Quận 7",
  ];
  const schedules = ["Ahjhj đồ ngốc", "Tuần 1 - HK1", "Lịch hè 2025"];

  return {
    id: i + 1,
    driverName: drivers[i % 3],
    startTime: "6:00 AM",
    endTime: "6:45 AM",
    busId: `B00${(i % 5) + 1}`,
    routeName: routes[i % 3],
    scheduleName: schedules[i % 3],
  };
});
// --- END DEMO DATA ---

// Component 1 dòng trong bảng
const TripRow = ({ trip }) => (
  <tr>
    <td>{trip.id}</td>
    <td>{trip.driverName}</td>
    <td>{trip.startTime}</td>
    <td>{trip.endTime}</td>
    <td>{trip.busId}</td>
    <td>{trip.routeName}</td>
    <td>
      <span
        className={`schedule-name ${
          trip.scheduleName === "Ahjhj đồ ngốc" ? "highlight" : ""
        }`}
      >
        {trip.scheduleName}
      </span>
    </td>
    <td>
      <div className="action-buttons">
        <button className="action-btn edit-btn">
          <FaPen />
        </button>
        <button className="action-btn delete-btn">
          <FaMinusCircle />
        </button>
      </div>
    </td>
  </tr>
);

// Component Phân trang (Tái sử dụng)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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
const TripListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrips = allTrips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allTrips.length / itemsPerPage);

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <span>Trang</span> / <span>Quản lý xe buýt</span> /{" "}
          <span>Danh sách chuyến đi</span>
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

      <div className="page-content">
        <div className="content-header">
          <h2>Danh sách chuyến đi</h2>
          <div className="header-controls">
            <div className="date-picker">
              <label htmlFor="date-select">Ngày</label>
              <div className="date-input-wrapper">
                <input
                  type="text"
                  id="date-select"
                  defaultValue="Thứ 2, 10/12/2025"
                />
                <FaCalendarAlt className="calendar-icon" />
              </div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên tài xế</th>
                <th>Thời gian đi</th>
                <th>Thời gian về</th>
                <th>Xe buýt</th>
                <th>Tuyến đường</th>
                <th>Lịch trình</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentTrips.map((trip) => (
                <TripRow key={trip.id} trip={trip} />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  );
};

export default TripListPage;
