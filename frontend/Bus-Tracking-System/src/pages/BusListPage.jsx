import React, { useState, useEffect } from "react";
import axios from "axios";
// Bỏ Link vì không còn dùng card nữa
import "./BusListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng chung
import {
  FaPlus,
  FaTimes,
  FaPen,
  FaMinusCircle,
  FaEllipsisH,
  FaExclamationTriangle, // Thêm icon cho modal xóa
} from "react-icons/fa";

// --- COMPONENT MODAL THÊM XE BUÝT (Đã cập nhật: Bỏ Tuyến đường) ---
const AddBusModal = ({ isOpen, onClose, onSave }) => {
  const [busName, setBusName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  useEffect(() => {
    // Reset form khi modal mở
    if (isOpen) {
      setBusName("");
      setPlateNumber("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Chỉ gửi busName và plateNumber, khớp với API POST
    onSave({ busName, plateNumber });
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
          {/* Bỏ trường chọn Tuyến đường */}
          <button type="submit" className="modal-submit-btn">
            Xác Nhận
          </button>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, busName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content confirm-delete" // Dùng chung class với DriverListPage nếu muốn đồng bộ style
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <FaExclamationTriangle size={40} color="#e74c3c" />
          <h4>Xác nhận xóa</h4>
        </div>
        <p className="confirm-text">
          Bạn có chắc chắn muốn xóa xe buýt <strong>{busName}</strong> không?
          Hành động này không thể hoàn tác.
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button
            className="confirm-btn delete-confirm-btn"
            onClick={onConfirm} // Gọi hàm xác nhận xóa từ props
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 1 DÒNG TRONG BẢNG XE BUÝT ---
const BusRow = ({ bus, onEdit, onDelete, onViewDetails }) => {
  const getStatusClass = (status) => {
    // API /all trả về status: true/false
    return status ? "status-active" : "status-maintenance";
  };

  return (
    <tr>
      <td style={{ textAlign: "center" }}>{bus.id}</td>
      {/* API /all trả về busName */}
      <td>{bus.busName || `BUS-${String(bus.id).padStart(3, "0")}`}</td>
      {/* API /all trả về plateNumber */}
      <td>{bus.plateNumber || "N/A"}</td>
      <td style={{ textAlign: "center" }}>
        <span className={`status-badge ${getStatusClass(bus.status)}`}>
          {bus.status ? "Đang hoạt động" : "Đang bảo trì"}
        </span>
      </td>
      {/* API /all trả về driverName */}
      <td>{bus.driverName || "Chưa phân công"}</td>
      {/* API /all trả về routeName */}
      <td>{bus.routeName || "Chưa phân công"}</td>
      <td className="cell-center">
        <div className="action-buttons">
          <button
            className="action-btn-student more-btn"
            title="Xem chi tiết"
            onClick={() => onViewDetails(bus)}
          >
            <FaEllipsisH />
          </button>
          {/* Gọi hàm onDelete khi nhấn nút xóa */}
          <button
            className="action-btn-student delete-btn"
            title="Xóa"
            onClick={() => onDelete(bus)}
          >
            <FaMinusCircle />
          </button>
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
  const [busToDelete, setBusToDelete] = useState(null); // State cho modal xác nhận xóa
  const itemsPerPage = 6;

  // --- HÀM GỌI API GET ALL (CÓ PHÂN TRANG) ---
  const fetchBusesFromApi = async (page) => {
    console.log(`Fetching data from API for page ${page}...`);
    setIsLoading(true);
    try {
      const apiUrl = `https://localhost:7229/api/v1/bus/all?PageNumber=${page}&PageSize=${itemsPerPage}`;
      console.log(`Calling API URL: ${apiUrl}`);
      const response = await axios.get(apiUrl);
      console.log(`API response for page ${page}:`, response.data);

      setBuses(response.data.items || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu xe buýt từ API:", error);
      setBuses([]);
      setTotalPages(0);
      alert(
        `Không thể tải danh sách xe buýt. Vui lòng kiểm tra backend và thử lại.\nLỗi: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để gọi API mỗi khi currentPage thay đổi
  useEffect(() => {
    console.log(
      `Component did mount or currentPage changed to ${currentPage}. Fetching data...`
    );
    fetchBusesFromApi(currentPage);
  }, [currentPage]);

  // --- HÀM XỬ LÝ LƯU XE BUÝT MỚI (API POST) ---
  const handleSaveBus = async (newBusData) => {
    console.log("handleSaveBus: Dữ liệu gửi lên API:", newBusData);
    try {
      const response = await axios.post(
        "https://localhost:7229/api/v1/bus/create",
        newBusData
      );
      console.log("handleSaveBus: API POST response:", response);
      if (response.status === 201 || response.status === 200) {
        alert("Thêm xe buýt thành công!");
        console.log(
          "handleSaveBus: Fetching data again after successful POST..."
        );
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          fetchBusesFromApi(1);
        }
      } else {
        alert(`Thêm xe buýt thất bại. Status code: ${response.status}`);
      }
    } catch (error) {
      console.error("handleSaveBus: Lỗi khi thêm xe buýt mới qua API:", error);
      let errorMessage = "Đã xảy ra lỗi khi thêm xe buýt.";
      if (error.response) {
        errorMessage += `\nServer response: ${
          error.response.status
        } - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage += "\nKhông nhận được phản hồi từ server.";
      } else {
        errorMessage += `\nLỗi: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  // --- HÀM MỞ MODAL XÁC NHẬN XÓA ---
  const handleOpenDeleteConfirm = (bus) => {
    setBusToDelete(bus); // Lưu thông tin xe cần xóa vào state
  };

  // --- HÀM XÁC NHẬN XÓA (GỌI API DELETE) ---
  const handleConfirmDelete = async () => {
    if (!busToDelete) return;

    console.log(`handleConfirmDelete: Deleting bus with ID: ${busToDelete.id}`);
    try {
      const apiUrl = `https://localhost:7229/api/v1/bus/${busToDelete.id}`;
      console.log(`Calling API URL: ${apiUrl}`);
      const response = await axios.delete(apiUrl);
      console.log("API DELETE response:", response);

      // API DELETE thường trả về 200 OK hoặc 204 No Content khi thành công
      if (response.status === 200 || response.status === 204) {
        alert(
          `Đã xóa xe buýt ${busToDelete.busName || busToDelete.id} thành công!`
        );
        // Sau khi xóa thành công, fetch lại dữ liệu cho trang hiện tại
        // Hoặc xử lý logic chuyển trang nếu trang hiện tại rỗng
        console.log(
          "handleConfirmDelete: Fetching data again after successful DELETE..."
        );

        // Kiểm tra xem trang hiện tại còn item nào không sau khi xóa
        // Nếu chỉ còn 1 item trên trang hiện tại VÀ trang hiện tại không phải trang 1
        if (buses.length === 1 && currentPage > 1) {
          // Lùi về trang trước đó
          setCurrentPage(currentPage - 1);
        } else {
          // Fetch lại dữ liệu cho trang hiện tại
          fetchBusesFromApi(currentPage);
        }
      } else {
        alert(`Xóa xe buýt thất bại. Status code: ${response.status}`);
      }
    } catch (error) {
      console.error(
        `handleConfirmDelete: Lỗi khi xóa xe buýt ID ${busToDelete.id}:`,
        error
      );
      let errorMessage = "Đã xảy ra lỗi khi xóa xe buýt.";
      if (error.response) {
        errorMessage += `\nServer response: ${
          error.response.status
        } - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage += "\nKhông nhận được phản hồi từ server.";
      } else {
        errorMessage += `\nLỗi: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setBusToDelete(null); // Đóng modal xác nhận
    }
  };

  // --- CÁC HÀM XỬ LÝ KHÁC (Tạm thời) ---
  const handleEditBus = (bus) =>
    alert(`Chức năng sửa xe ${bus.id} đang phát triển.`);
  const handleViewBusDetails = (bus) =>
    alert(`Chức năng xem chi tiết xe ${bus.id} đang phát triển.`);

  return (
    <>
      <AddBusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveBus}
      />
      {/* Render Modal Xác nhận Xóa */}
      <ConfirmDeleteModal
        isOpen={!!busToDelete}
        onClose={() => setBusToDelete(null)}
        onConfirm={handleConfirmDelete}
        busName={busToDelete?.busName || busToDelete?.id} // Hiển thị tên hoặc ID xe
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
          </div>
        </header>

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
                  <tbody>
                    {buses && buses.length > 0 ? (
                      buses.map((bus) => (
                        <BusRow
                          key={bus.id} // Đảm bảo key là duy nhất
                          bus={bus}
                          onEdit={handleEditBus}
                          // Thay đổi hàm gọi khi nhấn nút xóa
                          onDelete={handleOpenDeleteConfirm}
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
                onPageChange={setCurrentPage} // Truyền trực tiếp setCurrentPage
              />
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default BusListPage;
