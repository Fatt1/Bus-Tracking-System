import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./StudentListPage.css"; // CSS riêng cho trang này (nếu cần)
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng
import { FaPlus, FaPen, FaMinusCircle, FaEllipsisH } from "react-icons/fa";

// --- DEMO DATA ---
// Dữ liệu mẫu cho trang học sinh
const allStudents = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  name: `Phan Viết Huy ${i + 1}`,
  class: `12A${(i % 5) + 1}`,
  address: "273 An Dương Vương, Phường 3, Quận 5",
  parent: `Phan Viết Huy`,
  phone: `0987654321`,
}));
// --- END DEMO DATA ---

// Component 1 dòng trong bảng
const StudentRow = ({ student }) => (
  <tr>
    <td>{student.id}</td>
    <td>{student.name}</td>
    <td>{student.class}</td>
    <td>{student.address}</td>
    <td>{student.parent}</td>
    <td>{student.phone}</td>
    <td>
      <div className="action-buttons">
        <button className="action-btn-student more-btn">
          <FaEllipsisH />
        </button>
        <button className="action-btn-student delete-btn">
          <FaMinusCircle />
        </button>
        <button className="action-btn-student edit-btn">
          <FaPen />
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
const StudentListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = allStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allStudents.length / itemsPerPage);

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <span>Trang</span> / <span>Quản lý xe buýt</span> /{" "}
          <span>Danh sách học sinh</span>
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
          <h2>Danh sách học sinh</h2>
          <div className="header-controls">
            {/* Nút thêm học sinh */}
            <Link to="/students/add" className="control-btn add-btn">
              <FaPlus />
            </Link>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên học sinh</th>
                <th>Lớp</th>
                <th>Địa chỉ</th>
                <th>Phụ huynh</th>
                <th>Số điện thoại</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <StudentRow key={student.id} student={student} />
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

export default StudentListPage;
