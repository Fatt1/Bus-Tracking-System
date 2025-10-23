import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./BusListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng chung
import {
  FaPlus,
  FaTimes,
  FaPen,
  FaMinusCircle,
  FaEllipsisH,
} from "react-icons/fa";

// --- Dữ liệu mẫu cho Dropdown Tuyến đường trong Modal ---
const mockRoutes = [
  { id: 1, name: "An Dương Vương - Trần Hưng Đạo" },
  { id: 2, name: "Bến Thành - Suối Tiên" },
  { id: 3, name: "Ký túc xá khu B - Đại học Bách Khoa" },
];
// --- END DEMO DATA ---

// --- COMPONENT MODAL THÊM XE BUÝT (Giữ nguyên) ---
const AddBusModal = ({ isOpen, onClose, onSave, routes }) => {
  const [busName, setBusName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [routeId, setRouteId] = useState(routes[0]?.id || "");

  useEffect(() => {
    // Reset form khi modal mở
    if (isOpen) {
      setBusName("");
      setPlateNumber("");
      setRouteId(routes[0]?.id || "");
    }
  }, [isOpen, routes]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ busName, plateNumber, routeId });
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
              {/* Thêm option mặc định */}
              <option value="" disabled>
                -- Chọn tuyến đường --
              </option>
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

// --- COMPONENT 1 DÒNG TRONG BẢNG XE BUÝT ---
const BusRow = ({ bus, onEdit, onDelete, onViewDetails }) => {
  // Hàm xác định class CSS cho trạng thái kỹ thuật
  const getStatusClass = (status) => {
    // Giả sử API trả về true là hoạt động, false là bảo trì
    return status ? "status-active" : "status-maintenance";
  };

  return (
    <tr>
      <td>{bus.id}</td>
      <td>{bus.busName || `BUS-${String(bus.id).padStart(3, "0")}`}</td>
      <td>{bus.plateNumber}</td>
      <td>
        <span className={`status-badge ${getStatusClass(bus.status)}`}>
          {bus.status ? "Đang hoạt động" : "Đang bảo trì"}
        </span>
      </td>
      <td>{bus.driverName || "Chưa phân công"}</td>
      <td>{bus.routeName || "Chưa phân công"}</td>
      <td>
        <div className="action-buttons">
          {/* Nút xem chi tiết (tạm thời chưa có chức năng) */}
          <button
            className="action-btn-student more-btn"
            title="Xem chi tiết"
            onClick={() => onViewDetails(bus)}
          >
            <FaEllipsisH />
          </button>
          {/* Nút xóa (tạm thời chưa có chức năng) */}
          <button
            className="action-btn-student delete-btn"
            title="Xóa"
            onClick={() => onDelete(bus)}
          >
            <FaMinusCircle />
          </button>
          {/* Nút sửa (tạm thời chưa có chức năng) */}
          <button
            className="action-btn-student edit-btn"
            title="Sửa"
            onClick={() => onEdit(bus)}
          >
            <FaPen />
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- COMPONENT PHÂN TRANG (GIỮ NGUYÊN) ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // ... (Giữ nguyên code Pagination) ...
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

// --- COMPONENT CHÍNH CỦA TRANG ---
const BusListPage = () => {
  const [buses, setBuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const itemsPerPage = 6; // Đổi tên biến cho rõ ràng

  // CỜ ĐỂ CHỌN NGUỒN DỮ LIỆU (true: dùng API, false: dùng dữ liệu mẫu)
  const useApiData = true; // <-- THAY ĐỔI GIÁ TRỊ NÀY ĐỂ TEST

  // --- HÀM LẤY DỮ LIỆU MẪU ---
  const fetchMockBuses = () => {
    console.log("Fetching mock data...");
    setIsLoading(true);
    // Tạo dữ liệu mẫu tương tự API response
    const mockData = Array.from({ length: 19 }, (_, i) => ({
      id: i + 1,
      busName: `BUS-${String(i + 1).padStart(3, "0")}`,
      plateNumber: `51A-${String(10000 + i * 111).slice(-5)}`,
      status: Math.random() > 0.3, // true or false
      driverName: i % 4 === 0 ? null : `Tài xế ${String.fromCharCode(65 + i)}`,
      routeName: i % 3 === 0 ? null : mockRoutes[i % mockRoutes.length].name,
    }));

    // Giả lập độ trễ mạng
    setTimeout(() => {
      const totalItems = mockData.length;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = mockData.slice(startIndex, endIndex);

      setBuses(paginatedData);
      setTotalPages(calculatedTotalPages);
      setIsLoading(false);
      console.log("Mock data loaded:", paginatedData);
    }, 500); // 500ms delay
  };

  // --- HÀM GỌI API ---
  const fetchBusesFromApi = async () => {
    console.log("Fetching data from API...");
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://localhost:7229/api/v1/bus/all?page=${currentPage}&pageSize=${itemsPerPage}`
      );
      // Giả sử API trả về đúng cấu trúc { items: [], totalPages: ... }
      setBuses(response.data.items || []); // Đảm bảo luôn là mảng
      setTotalPages(response.data.totalPages || 0); // Đảm bảo luôn là số
      console.log("API data loaded:", response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu xe buýt từ API:", error);
      setBuses([]); // Reset về mảng rỗng nếu lỗi
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để gọi hàm fetch dữ liệu tương ứng
  useEffect(() => {
    if (useApiData) {
      fetchBusesFromApi();
    } else {
      fetchMockBuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, useApiData]); // Thêm useApiData để fetch lại nếu cờ thay đổi (tùy chọn)

  // Hàm xử lý khi lưu xe buýt mới (tạm thời)
  const handleSaveBus = (newBusData) => {
    console.log("Dữ liệu xe buýt mới (chưa gọi API):", newBusData);
    // Tạm thời thêm vào đầu danh sách ở client để thấy thay đổi
    // Cần gọi API POST và fetch lại dữ liệu sau này
    const newBus = {
      id: Date.now(), // ID tạm
      ...newBusData,
      status: true, // Mặc định là hoạt động
      driverName: null, // Mặc định chưa có tài xế
      routeName:
        mockRoutes.find((r) => r.id === parseInt(newBusData.routeId))?.name ||
        null,
    };
    setBuses((prev) => [newBus, ...prev]);
    setIsAddModalOpen(false);
  };

  // Các hàm xử lý nút thao tác (tạm thời)
  const handleEditBus = (bus) =>
    alert(`Chức năng sửa xe ${bus.id} đang phát triển.`);
  const handleDeleteBus = (bus) =>
    alert(`Chức năng xóa xe ${bus.id} đang phát triển.`);
  const handleViewBusDetails = (bus) =>
    alert(`Chức năng xem chi tiết xe ${bus.id} đang phát triển.`);

  return (
    <>
      <AddBusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveBus}
        routes={mockRoutes} // Truyền danh sách tuyến đường mẫu vào modal
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
            {/* Nút thêm đã chuyển xuống content-header */}
          </div>
        </header>
        {/* Banner đã bị loại bỏ theo thiết kế mới */}
        <div className="page-content">
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
              {/* CONTAINER BẢNG */}
              <div className="table-container">
                <table>
                  {/* TIÊU ĐỀ BẢNG */}
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên xe</th>
                      <th>Biển số xe</th>
                      <th>Trạng thái kỹ thuật</th>
                      <th>Tài xế</th>
                      <th>Tuyến đường</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  {/* NỘI DUNG BẢNG */}
                  <tbody>
                    {buses.length > 0 ? (
                      buses.map((bus) => (
                        <BusRow
                          key={bus.id}
                          bus={bus}
                          onEdit={handleEditBus}
                          onDelete={handleDeleteBus}
                          onViewDetails={handleViewBusDetails}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          Không có dữ liệu xe buýt.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* PHÂN TRANG */}
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
