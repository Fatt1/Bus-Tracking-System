import React, { useState } from "react";
import "./RouteListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng
import { FaMapMarkerAlt, FaPlus } from "react-icons/fa";

// --- DEMO DATA ---
const allRoutes = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  name:
    i % 3 === 0
      ? "Lê Duẩn - Nguyễn Thị Minh Khai - Điện Biên Phủ"
      : "An Dương Vương - Trần Hưng Đạo",
  type: "Đưa đi/ Đón về",
  assignedBuses: Math.floor(Math.random() * 5) + 1, // Random từ 1 đến 5
}));
// --- END DEMO DATA ---

// Component 1 dòng trong bảng
const RouteRow = ({ route }) => (
  <tr>
    <td>{route.id}</td>
    <td>{route.name}</td>
    <td>{route.type}</td>
    <td>
      <div className="assign-column">
        <button className="assigned-bus-btn">
          {/* Thêm số 0 đằng trước nếu nhỏ hơn 10 */}
          {String(route.assignedBuses).padStart(2, "0")}
        </button>
      </div>
    </td>
    <td>
      <div className="assign-column">
        <button className="map-btn">
          <FaMapMarkerAlt />
        </button>
      </div>
    </td>
  </tr>
);

// Component Phân trang
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
const RouteListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoutes = allRoutes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allRoutes.length / itemsPerPage);

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <span>Trang</span> / <span>Quản lý xe buýt</span> /{" "}
          <span>Danh sách tuyến đường</span>
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
          <h2>Danh sách tuyến đường</h2>
          <div className="header-controls">
            <button className="control-btn add-btn">
              <FaPlus />
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên tuyến đường</th>
                <th>Tuyến đường</th>
                <th>
                  <div className="assign-column"> Xe được phân công</div>
                </th>
                <th>Bản đồ</th>
              </tr>
            </thead>
            <tbody>
              {currentRoutes.map((route) => (
                <RouteRow key={route.id} route={route} />
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

export default RouteListPage;
