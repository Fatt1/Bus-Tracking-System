// src/pages/BusListPage.jsx

import React, { useState } from "react";
import "./BusListPage.css"; // Sẽ tạo ở bước tiếp theo
import busImg from "../assets/bus.png";
import {
  FaHome,
  FaBus,
  FaRoute,
  FaUserTie,
  FaUserGraduate,
  FaCommentDots,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { SideBar } from "../components/SideBar";

// DEMO DATA: Mảng chứa 19 xe buýt. Sau này bạn sẽ thay thế bằng dữ liệu từ API.
const allBuses = Array.from({ length: 19 }, (_, i) => ({
  id: `00${i + 1}`.slice(-3), // Tạo ID dạng 001, 002, ... 019
  licensePlate: `29A - ${Math.floor(10000 + Math.random() * 90000)}`,
  driver: `Nguyễn Văn ${String.fromCharCode(65 + i)}`, // Nguyễn Văn A, B, C...
  status: Math.random() > 0.3 ? "Đang hoạt động" : "Không hoạt động", // 70% hoạt động
  imageUrl: busImg, // Dùng chung 1 ảnh cho demo
}));

// Component Sidebar (Tương tự trang Dashboard để đảm bảo tính nhất quán)
// const Sidebar = () => (
//   <aside className="sidebar">
//     <div className="sidebar-header">
//       <h3>36 36 BUS BUS</h3>
//     </div>
//     <nav className="sidebar-nav">
//       <ul>
//         <li>
//           <a href="/dashboard">
//             <FaHome /> Trang chủ
//           </a>
//         </li>
//         <li className="active">
//           <a href="/buses">
//             <FaBus /> Xe buýt
//           </a>
//         </li>
//         <li>
//           <a href="#">
//             <FaRoute /> Tuyến đường
//           </a>
//         </li>
//         <li>
//           <a href="#">
//             <FaUserTie /> Tài xế
//           </a>
//         </li>
//         <li>
//           <a href="#">
//             <FaUserGraduate /> Học sinh
//           </a>
//         </li>
//         <li>
//           <a href="#">
//             <FaCommentDots /> Nhắn tin
//           </a>
//         </li>
//       </ul>
//     </nav>
//   </aside>
// );

// Component Card cho mỗi xe buýt
const BusCard = ({ bus }) => (
  <div className="bus-card">
    <img src={bus.imageUrl || busImg} alt={`Xe buýt ${bus.id}`} />
    <div className="bus-card-info">
      <p>
        <strong>Xe:</strong> {bus.id}
      </p>
      <p>
        <strong>Biển số xe:</strong> {bus.licensePlate}
      </p>
      <p>
        <strong>Tài xế:</strong> {bus.driver}
      </p>
      <div className="bus-status">
        <strong>Trạng thái:</strong> {bus.status}
        <span
          className={`status-dot ${
            bus.status === "Đang hoạt động" ? "active" : "inactive"
          }`}
        ></span>
      </div>
    </div>
  </div>
);

// Component Phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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

// Component chính của trang
const BusListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const busesPerPage = 6; // Số xe buýt hiển thị trên mỗi trang

  // Logic tính toán phân trang
  const indexOfLastBus = currentPage * busesPerPage;
  const indexOfFirstBus = indexOfLastBus - busesPerPage;
  const currentBuses = allBuses.slice(indexOfFirstBus, indexOfLastBus);
  const totalPages = Math.ceil(allBuses.length / busesPerPage);

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
          {/* Banner sẽ được đặt làm nền bằng CSS */}
          <h2>Danh sách xe buýt</h2>
        </div>

        <div className="page-content">
          <div className="bus-grid">
            {currentBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
    </div>
  );
};

export default BusListPage;
