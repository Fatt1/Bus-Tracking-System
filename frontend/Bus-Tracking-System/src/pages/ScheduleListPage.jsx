import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LayoutTable.css";
import "./ScheduleListPage.css";
import {
  FaCalendarAlt,
  FaList,
  FaPlus,
  FaPen,
  FaMinusCircle,
} from "react-icons/fa";

// --- DEMO DATA ---
// Sau này bạn sẽ thay thế bằng dữ liệu từ API
const allSchedules = Array.from({ length: 25 }, (_, i) => {
  const types = ["Tuần", "Tháng", "Năm"];
  const statuses = ["Đang hoạt động", "Kết thúc", "Chưa hoạt động"];
  const randomStatus = statuses[i % 3];

  return {
    id: i + 1,
    name: `Tuần ${i + 1} - HK${(i % 2) + 1} - 2025`,
    startDate: "10/10/2025",
    endDate: "10/10/2025",
    type: types[i % 3],
    status: randomStatus,
  };
});
// --- END DEMO DATA ---

// Component nhỏ để render 1 dòng trong bảng
const ScheduleRow = ({ schedule }) => {
  // Hàm để xác định class CSS dựa trên trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case "Đang hoạt động":
        return "status-active";
      case "Kết thúc":
        return "status-finished";
      case "Chưa hoạt động":
        return "status-pending";
      default:
        return "";
    }
  };

  return (
    <tr>
      <td>{schedule.id}</td>
      <td>{schedule.name}</td>
      <td>{schedule.startDate}</td>
      <td>{schedule.endDate}</td>
      <td>{schedule.type}</td>
      <td>
        <span className={`status-badge ${getStatusClass(schedule.status)}`}>
          {schedule.status}
        </span>
      </td>
      <td>
        <div className="action-buttons">
          <button className="action-btn delete-btn">
            <FaMinusCircle />
          </button>
          <button className="action-btn edit-btn">
            <FaPen />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Component Phân trang (Tương tự các trang trước)
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
const ScheduleListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchedules = allSchedules.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(allSchedules.length / itemsPerPage);

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <span>Trang</span> / <span>Quản lý xe buýt</span> /{" "}
          <span>Danh sách lịch trình</span>
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
          <h2>Danh sách lịch trình</h2>
          <div className="header-controls">
            <div className="date-picker">
              <label htmlFor="month-select">Tháng</label>
              <div className="date-input-wrapper">
                <input type="text" id="month-select" defaultValue="10/2025" />
                <FaCalendarAlt className="calendar-icon" />
              </div>
            </div>
            {/* Link dẫn đến trang danh sách chuyến đi */}
            <Link to="/schedule-trips" className="control-btn list-btn">
              <FaList />
              <span>Danh sách chuyến đi</span>
            </Link>
            {/* Link dẫn đến trang thêm mới lịch trình */}
            <Link to="add-schedule" className="control-btn add-btn">
              <FaPlus />
            </Link>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên lịch trình</th>
                <th>Thời gian áp dụng</th>
                <th>Thời gian kết thúc</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentSchedules.map((schedule) => (
                <ScheduleRow key={schedule.id} schedule={schedule} />
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

export default ScheduleListPage;
