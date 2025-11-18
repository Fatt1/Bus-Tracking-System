import React, { useState, useEffect } from "react";
import api from "../../utils/api"; // Import api instance với token support
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Bỏ Link vì không còn dùng card nữa
import "./BusListPage.css"; // CSS riêng cho trang này
import "../LayoutTable.css"; // Tái sử dụng CSS layout bảng chung
import AdminHeader from "../../components/admin/AdminHeader"; // Import AdminHeader
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
  const { t } = useTranslation();
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
          <h3>Smart Bus</h3>
          <h4>{t("bus.addBus")}</h4>
        </div>
        <form onSubmit={handleSubmit} className="modal-form bus-modal-form">
          <div className="form-group">
            <label htmlFor="busName">{t("bus.busName")}</label>
            <input
              type="text"
              id="busName"
              value={busName}
              onChange={(e) => setBusName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="plateNumber">{t("bus.plateNumber")}</label>
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
            {t("common.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, busName }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content confirm-delete" // Dùng chung class với DriverListPage nếu muốn đồng bộ style
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <FaExclamationTriangle size={40} color="#e74c3c" />
          <h4>{t("bus.confirmDelete")}</h4>
        </div>
        <p className="confirm-text">
          {t("bus.deleteMessage")} <strong>{busName}</strong>{" "}
          {t("bus.cannotUndo")}
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className="confirm-btn delete-confirm-btn"
            onClick={onConfirm} // Gọi hàm xác nhận xóa từ props
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 1 DÒNG TRONG BẢNG XE BUÝT ---
const BusRow = ({ bus, onEdit, onDelete, onViewDetails }) => {
  const { t } = useTranslation();
  const getStatusClass = (status) => {
    // Backend trả enum: 1 = Active, 2 = Maintenance
    return Number(status) === 1 ? "status-active" : "status-maintenance";
  };

  return (
    <tr>
      <td>{bus.id}</td>
      {/* API /all trả về busName */}
      <td>{bus.busName || `BUS-${String(bus.id).padStart(3, "0")}`}</td>
      {/* API /all trả về plateNumber */}
      <td>{bus.plateNumber || "N/A"}</td>
      <td>
        <span className={`status-badge ${getStatusClass(bus.status)}`}>
          {Number(bus.status) === 1 ? t("bus.active") : t("bus.maintenance")}
        </span>
      </td>
      {/* API /all trả về driverName */}
      <td>{bus.driverName || t("bus.notAssigned")}</td>
      {/* API /all trả về routeName */}
      <td>{bus.routeName || t("bus.notAssigned")}</td>
      <td>
        <div className="action-buttons">
          <button
            className="action-btn-student more-btn"
            title={t("common.detail")}
            onClick={() => onViewDetails(bus)}
          >
            <FaEllipsisH />
          </button>
          {/* Gọi hàm onDelete khi nhấn nút xóa */}
          <button
            className="action-btn-student delete-btn"
            title={t("common.delete")}
            onClick={() => onDelete(bus)}
          >
            <FaMinusCircle />
          </button>
          <button
            className="action-btn-student edit-btn"
            title={t("common.edit")}
            onClick={() => onEdit(bus)}
          >
            <FaPen />
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- COMPONENT CARD CHO MOBILE VIEW ---
const BusCard = ({ bus, onEdit, onDelete, onViewDetails }) => {
  const { t } = useTranslation();
  const getStatusClass = (status) => {
    return Number(status) === 1 ? "status-active" : "status-maintenance";
  };

  return (
    <div className="mobile-card">
      <div className="mobile-card-header">
        <div className="mobile-card-title">
          {bus.busName || `BUS-${String(bus.id).padStart(3, "0")}`}
        </div>
        <span className={`status-badge ${getStatusClass(bus.status)}`}>
          {Number(bus.status) === 1 ? t("bus.active") : t("bus.maintenance")}
        </span>
      </div>
      <div className="mobile-card-body">
        <div className="mobile-card-row">
          <span className="mobile-card-label">{t("common.stt")}:</span>
          <span className="mobile-card-value">{bus.id}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">{t("bus.plateNumber")}:</span>
          <span className="mobile-card-value">{bus.plateNumber || "N/A"}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">{t("bus.driver")}:</span>
          <span className="mobile-card-value">{bus.driverName || t("bus.notAssigned")}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">{t("bus.route")}:</span>
          <span className="mobile-card-value">{bus.routeName || t("bus.notAssigned")}</span>
        </div>
      </div>
      <div className="mobile-card-actions">
        <button
          className="action-btn-student more-btn"
          title={t("common.detail")}
          onClick={() => onViewDetails(bus)}
        >
          <FaEllipsisH />
        </button>
        <button
          className="action-btn-student delete-btn"
          title={t("common.delete")}
          onClick={() => onDelete(bus)}
        >
          <FaMinusCircle />
        </button>
        <button
          className="action-btn-student edit-btn"
          title={t("common.edit")}
          onClick={() => onEdit(bus)}
        >
          <FaPen />
        </button>
      </div>
    </div>
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
// --- MODAL SỬA XE BUÝT ---
const EditBusModal = ({ isOpen, onClose, onSave, bus }) => {
  const { t } = useTranslation();
  const [busName, setBusName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [status, setStatus] = useState(1);

  useEffect(() => {
    if (isOpen && bus) {
      setBusName(bus.busName || "");
      setPlateNumber(bus.plateNumber || "");
      setStatus(Number(bus.status) || 1);
    }
  }, [isOpen, bus]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: bus.id, busName, plateNumber, status: Number(status) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          <h3>Smart Bus</h3>
          <h4>{t("bus.editBus")}</h4>
        </div>
        <form onSubmit={handleSubmit} className="modal-form bus-modal-form">
          <div className="form-group">
            <label htmlFor="busName_edit">{t("bus.busName")}</label>
            <input
              type="text"
              id="busName_edit"
              value={busName}
              onChange={(e) => setBusName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="plateNumber_edit">{t("bus.plateNumber")}</label>
            <input
              type="text"
              id="plateNumber_edit"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status_edit">{t("bus.technicalStatus")}</label>
            <select
              id="status_edit"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value={1}>{t("bus.active")}</option>
              <option value={2}>{t("bus.maintenance")}</option>
            </select>
          </div>
          <button type="submit" className="modal-submit-btn">
            {t("common.save")}
          </button>
        </form>
      </div>
    </div>
  );
};

const BusListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [busToEdit, setBusToEdit] = useState(null);
  const [busToDelete, setBusToDelete] = useState(null); // State cho modal xác nhận xóa
  const itemsPerPage = 6;

  // --- HÀM GỌI API GET ALL (CÓ PHÂN TRANG) ---
  const fetchBusesFromApi = async (page) => {
    console.log(`Fetching data from API for page ${page}...`);
    setIsLoading(true);
    try {
      const response = await api.get("/api/v1/bus/all", {
        params: { PageNumber: page, PageSize: itemsPerPage },
      });
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
      const response = await api.post("/api/v1/bus/create", newBusData);
      console.log("handleSaveBus: API POST response:", response);
      if (response.status === 201 || response.status === 200) {
        alert(t("bus.addSuccess"));
        console.log(
          "handleSaveBus: Fetching data again after successful POST..."
        );
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          fetchBusesFromApi(1);
        }
      } else {
        alert(`${t("bus.addSuccess")} Status code: ${response.status}`);
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

  // --- HÀM XỬ LÝ LƯU SỬA XE BUÝT (API PUT) ---
  const handleUpdateBus = async (updatedBus) => {
    try {
      const { id, busName, plateNumber, status } = updatedBus;
      const response = await api.put(`/api/v1/bus/${id}`, {
        id,
        busName,
        plateNumber,
        status,
      });
      console.log("API PUT response:", response);
      if (response.status === 204 || response.status === 200) {
        alert(t("bus.updateSuccess"));
        fetchBusesFromApi(currentPage);
      } else {
        alert(`${t("bus.updateSuccess")} Status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật xe buýt:", error);
      let errorMessage = "Đã xảy ra lỗi khi cập nhật xe buýt.";
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
      setIsEditModalOpen(false);
      setBusToEdit(null);
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
      const response = await api.delete(`/api/v1/bus/${busToDelete.id}`);
      console.log("API DELETE response:", response);

      // API DELETE thường trả về 200 OK hoặc 204 No Content khi thành công
      if (response.status === 200 || response.status === 204) {
        alert(
          `${t("bus.deleteSuccess")} ${busToDelete.busName || busToDelete.id} ${
            t("bus.addSuccess").split("!")[0]
          }!`
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
  const handleEditBus = (bus) => {
    setBusToEdit(bus);
    setIsEditModalOpen(true);
  };
  const handleViewBusDetails = (bus) => navigate(`/bus/${bus.id}`);

  return (
    <>
      <AddBusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveBus}
      />
      <EditBusModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setBusToEdit(null);
        }}
        onSave={handleUpdateBus}
        bus={busToEdit}
      />
      {/* Render Modal Xác nhận Xóa */}
      <ConfirmDeleteModal
        isOpen={!!busToDelete}
        onClose={() => setBusToDelete(null)}
        onConfirm={handleConfirmDelete}
        busName={busToDelete?.busName || busToDelete?.id} // Hiển thị tên hoặc ID xe
      />

      <main className="main-content-area">
        <AdminHeader breadcrumbs={t("bus.breadcrumb")} />

        <div className="page-content">
          <div className="content-header">
            <h2>{t("bus.title")}</h2>
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
            <div className="loading-message">{t("bus.loadingData")}</div>
          ) : (
            <>
              {/* CONTAINER BẢNG - Desktop & Tablet */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("common.stt")}</th>
                      <th>{t("bus.busName")}</th>
                      <th>{t("bus.plateNumber")}</th>
                      <th>{t("bus.technicalStatus")}</th>
                      <th>{t("bus.driver")}</th>
                      <th>{t("bus.route")}</th>
                      <th>{t("common.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses && buses.length > 0 ? (
                      buses.map((bus) => (
                        <BusRow
                          key={bus.id}
                          bus={bus}
                          onEdit={handleEditBus}
                          onDelete={handleOpenDeleteConfirm}
                          onViewDetails={handleViewBusDetails}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">{t("bus.noData")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* CARD LIST - Mobile Only */}
              <div className="mobile-card-list">
                {buses && buses.length > 0 ? (
                  buses.map((bus) => (
                    <BusCard
                      key={bus.id}
                      bus={bus}
                      onEdit={handleEditBus}
                      onDelete={handleOpenDeleteConfirm}
                      onViewDetails={handleViewBusDetails}
                    />
                  ))
                ) : (
                  <div className="no-data-message">{t("bus.noData")}</div>
                )}
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
