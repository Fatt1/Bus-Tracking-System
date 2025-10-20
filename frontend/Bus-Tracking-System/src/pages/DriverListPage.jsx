import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./DriverListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng
import {
  FaPlus,
  FaPen,
  FaMinusCircle,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";

// --- DEMO DATA ---
const initialDrivers = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  name: `Phan Viết Huy ${i + 1}`,
  busId: `B00${(i % 5) + 1}`,
  // Thêm dữ liệu mẫu cho modal
  phone: `098765432${i % 10}`,
  birthDate: "04/05/2004",
  citizenId: `1234567890${i % 100}`,
  address: "273 An Dương Vương, P.3, Q.5",
  gender: i % 2 === 0 ? "Nam" : "Nữ",
}));
// --- END DEMO DATA ---

// Component Modal để thêm tài xế mới
const AddDriverModal = ({ isOpen, onClose, onAddDriver }) => {
  const [newDriver, setNewDriver] = useState({
    name: "",
    busId: "",
    phone: "",
    birthDate: "",
    citizenId: "",
    address: "",
    gender: "Nam",
  });

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDriver((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddDriver(newDriver);
    onClose(); // Đóng modal sau khi thêm
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          <h3>36 36 BUS BUS</h3>
          <h4>Thông Tin Chi Tiết Tài Xế</h4>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Họ tên</label>
              <input
                type="text"
                id="name"
                name="name"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="busId">Xe buýt phụ trách</label>
              <input
                type="text"
                id="busId"
                name="busId"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="text"
              id="phone"
              name="phone"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthDate">Ngày sinh</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="citizenId">Căn cước công dân</label>
            <input
              type="text"
              id="citizenId"
              name="citizenId"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Địa chỉ thường trú</label>
            <input
              type="text"
              id="address"
              name="address"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Giới tính</label>
            <div className="gender-options">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Nam"
                  checked={newDriver.gender === "Nam"}
                  onChange={handleChange}
                />{" "}
                Nam
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Nữ"
                  checked={newDriver.gender === "Nữ"}
                  onChange={handleChange}
                />{" "}
                Nữ
              </label>
            </div>
          </div>
          <button type="submit" className="modal-submit-btn">
            Xác Nhận
          </button>
        </form>
      </div>
    </div>
  );
};

// Component 1 dòng trong bảng
const DriverRow = ({ driver }) => (
  <tr>
    <td>{driver.id}</td>
    <td>{driver.name}</td>
    <td>{driver.busId}</td>
    <td>
      <button className="action-btn-driver file-btn">
        <FaFileAlt />
      </button>
    </td>
    <td>
      <div className="action-buttons">
        <button className="action-btn-driver delete-btn">
          <FaMinusCircle />
        </button>
        <button className="action-btn-driver edit-btn">
          <FaPen />
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
const DriverListPage = () => {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6;

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDrivers = drivers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(drivers.length / itemsPerPage);

  const handleAddDriver = (newDriver) => {
    setDrivers((prevDrivers) => [
      ...prevDrivers,
      { id: prevDrivers.length + 1, ...newDriver },
    ]);
  };

  return (
    <>
      <AddDriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDriver={handleAddDriver}
      />
      <main className="main-content-area">
        <header className="page-header">
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Quản lý xe buýt</span> /{" "}
            <span>Danh sách tài xế</span>
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
            <h2>Danh sách tài xế</h2>
            <div className="header-controls">
              <button
                onClick={() => setIsModalOpen(true)}
                className="control-btn add-btn"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên tài xế</th>
                  <th>Xe phụ trách</th>
                  <th>Hồ sơ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentDrivers.map((driver) => (
                  <DriverRow key={driver.id} driver={driver} />
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
    </>
  );
};

export default DriverListPage;
