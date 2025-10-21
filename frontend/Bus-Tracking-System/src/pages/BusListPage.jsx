import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./BusListPage.css";
import busImg from "../assets/bus.png";
import { FaPlus, FaTimes } from "react-icons/fa"; // Thêm icon

// --- DEMO DATA cho dropdown tuyến đường ---
const mockRoutes = [
  { id: 1, name: "An Dương Vương - Trần Hưng Đạo" },
  { id: 2, name: "Bến Thành - Suối Tiên" },
  { id: 3, name: "Ký túc xá khu B - Đại học Bách Khoa" },
];
// --- END DEMO DATA ---

// --- COMPONENT MODAL THÊM XE BUÝT ---
const AddBusModal = ({ isOpen, onClose, onSave, routes }) => {
  const [busName, setBusName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [routeId, setRouteId] = useState(routes[0]?.id || "");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hiện tại chỉ đóng modal, sau này sẽ gọi API POST
    onSave({ busName, plateNumber, routeId });
    // Reset form sau khi đóng
    setBusName("");
    setPlateNumber("");
    setRouteId(routes[0]?.id || "");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          <h3>36 36 BUS BUS</h3>
          <h4>Thêm xe buýt</h4>
        </div>
        <form onSubmit={handleSubmit} className="modal-form bus-modal-form">
          <div className="form-group">
            <label htmlFor="busName">Tên xe buýt</label>
            <input
              type="text"
              id="busName"
              value={busName}
              onChange={(e) => setBusName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="plateNumber">Biển số xe</label>
            <input
              type="text"
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="routeId">Tuyến đường</label>
            <select
              id="routeId"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              required
            >
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="modal-submit-btn">
            Xác Nhận
          </button>
        </form>
      </div>
    </div>
  );
};

// --- CÁC COMPONENT CŨ (GIỮ NGUYÊN) ---
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

// --- COMPONENT CHÍNH CỦA TRANG (ĐÃ CẬP NHẬT) ---
const BusListPage = () => {
  const [buses, setBuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State cho modal
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

  const handleSaveBus = (newBusData) => {
    console.log("Dữ liệu xe buýt mới:", newBusData);
    // Sau này bạn sẽ thêm logic gọi API POST ở đây
    setIsAddModalOpen(false); // Đóng modal sau khi "lưu"
  };

  return (
    <>
      <AddBusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveBus}
        routes={mockRoutes}
      />
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
            {/* NÚT THÊM MỚI ĐÃ BỊ XÓA KHỎI ĐÂY */}
          </div>
        </header>
        {/* <div className="page-banner">{/* Tiêu đề đã bị xóa khỏi đây */}
        <div className="page-content">
          {/* SECTION MỚI CHO TIÊU ĐỀ VÀ NÚT BẤM */}
          <div className="content-header">
            <h2>Danh sách xe buýt</h2>
            <div className="header-controls">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="control-btn add-btn"
              >
                <FaPlus />
              </button>
            </div>
          </div>

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
    </>
  );
};

export default BusListPage;
