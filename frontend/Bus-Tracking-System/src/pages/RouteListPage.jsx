import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../utils/api"; // Import api instance với withCredentials
import "./RouteListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng
import { FaMapMarkerAlt, FaPlus, FaTimes, FaSpinner } from "react-icons/fa"; // Thêm FaSpinner

// --- COMPONENT MODAL HIỂN THỊ DANH SÁCH HỌC SINH (Đã cập nhật) ---
const StudentListModal = ({
  isOpen,
  onClose,
  routeName,
  students,
  isLoading,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content student-list-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          {/* <h3>36 36 BUS BUS</h3> */} {/* Bỏ bớt nếu muốn giống hình */}
          <h4>
            {t("route.studentList")}: {routeName}
          </h4>
        </div>
        <div className="student-list-table-container">
          {isLoading ? (
            <div className="modal-loading">
              <FaSpinner className="spinner" /> {t("route.loadingStudents")}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t("common.stt")}</th>
                  <th>{t("route.studentName")}</th>
                  <th>{t("route.pickupPoint")}</th>
                </tr>
              </thead>
              <tbody>
                {students && students.length > 0 ? (
                  students.map((student, index) => (
                    // API trả về fullName và stopPointName
                    <tr key={index}>
                      {" "}
                      {/* Dùng index làm key nếu không có ID duy nhất */}
                      <td>{index + 1}</td>
                      <td>{student.fullName}</td>
                      <td>{student.stopPointName}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center" }}>
                      {t("route.noStudents")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Có thể thêm nút Đóng ở đây nếu cần */}
        <div
          className="form-actions modal-actions"
          style={{ justifyContent: "center" }}
        >
          <button
            type="button"
            className="action-btn-form cancel-btn"
            onClick={onClose}
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component 1 dòng trong bảng (Đã cập nhật theo yêu cầu API)
const RouteRow = ({ route, onViewStudents }) => {
  const { t } = useTranslation();

  // Hàm xử lý mảng stopPoints thành chuỗi
  const formatStopPoints = (stopPoints) => {
    if (!Array.isArray(stopPoints) || stopPoints.length === 0) {
      return t("route.noStopPoints");
    }
    // Sắp xếp theo sequenceOrder trước khi join (đề phòng API trả về không theo thứ tự)
    return stopPoints
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
      .map((point) => point.pointName)
      .join(" - "); // Ngăn cách bằng dấu gạch ngang
  };

  return (
    <tr>
      {/* API trả về id */}
      <td style={{ textAlign: "center" }}>{route.id}</td>
      {/* API trả về routeName */}
      <td>{route.routeName}</td>
      {/* Xử lý stopPoints */}
      <td>{formatStopPoints(route.stopPoints)}</td>
      {/* Cột Số học sinh (Đã sửa) */}
      <td className="student-count-cell">
        {/* API trả về studentCounts */}
        <div>{route.studentCounts ?? 0}</div>
        {/* Chỉ hiển thị nút khi có học sinh */}
        {(route.studentCounts ?? 0) > 0 && (
          <button
            className="view-students-btn"
            onClick={() => onViewStudents(route)} // Truyền cả object route
          >
            {t("route.viewList")}
          </button>
        )}
      </td>
      {/* Cột Bản đồ */}
      <td className="cell-center">
        <button className="map-btn" title={t("route.viewMap")}>
          <FaMapMarkerAlt />
        </button>
      </td>
    </tr>
  );
};

// Component chính của trang (Đã cập nhật state và logic)
const RouteListPage = () => {
  const { t } = useTranslation();

  const [routes, setRoutes] = useState([]); // State lưu danh sách tuyến đường
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null); // Lưu route đang xem HS
  const [modalStudents, setModalStudents] = useState([]); // Lưu DS học sinh cho modal
  const [isModalLoading, setIsModalLoading] = useState(false); // Loading cho modal

  // --- HÀM GỌI API LẤY DANH SÁCH TUYẾN ĐƯỜNG ---
  const fetchRoutes = async () => {
    console.log("Fetching route list...");
    setIsLoading(true);
    try {
      // Gọi API với withCredentials để gửi JWT cookie
      console.log(`Calling API: /api/v1/route/all?PageNumber=1&PageSize=10`);
      const response = await api.get("/api/v1/route/all", {
        params: {
          PageNumber: 1,
          PageSize: 10,
        },
      });
      console.log(`API response (routes):`, response.data);
      setRoutes(response.data.items || []); // Chỉ lấy mảng items
    } catch (error) {
      console.error("Lỗi khi tải danh sách tuyến đường:", error);
      setRoutes([]);

      // Hiển thị lỗi chi tiết hơn
      const errorMsg =
        error.response?.status === 401
          ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          : `Không thể tải danh sách tuyến đường. Vui lòng kiểm tra backend và thử lại.\nLỗi: ${error.message}`;

      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để gọi API khi component mount lần đầu
  useEffect(() => {
    fetchRoutes();
  }, []); // Dependency rỗng

  // --- HÀM MỞ MODAL VÀ GỌI API LẤY DANH SÁCH HỌC SINH ---
  const handleViewStudents = async (route) => {
    console.log(
      `Viewing students for route ID: ${route.id}, Name: ${route.routeName}`
    );
    setSelectedRoute(route); // Lưu thông tin route để hiển thị tên
    setIsStudentModalOpen(true);
    setIsModalLoading(true); // Bắt đầu loading cho modal
    setModalStudents([]); // Xóa danh sách cũ

    try {
      console.log(
        `Calling student list API: /api/v1/route/${route.id}/students`
      );
      const response = await api.get(`/api/v1/route/${route.id}/students`);
      console.log(
        `API response (students for route ${route.id}):`,
        response.data
      );
      // API trả về trực tiếp mảng học sinh
      setModalStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(
        `Lỗi khi tải danh sách học sinh cho tuyến ${route.id}:`,
        error
      );
      setModalStudents([]);

      const errorMsg =
        error.response?.status === 401
          ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          : `Không thể tải danh sách học sinh. Vui lòng thử lại.\nLỗi: ${error.message}`;

      alert(errorMsg);
    } finally {
      setIsModalLoading(false); // Kết thúc loading cho modal
    }
  };

  // Hàm đóng modal
  const handleCloseStudentModal = () => {
    setIsStudentModalOpen(false);
    setSelectedRoute(null);
    setModalStudents([]); // Reset danh sách học sinh
  };

  return (
    <>
      {/* Render Modal */}
      <StudentListModal
        isOpen={isStudentModalOpen}
        onClose={handleCloseStudentModal}
        routeName={selectedRoute?.routeName}
        students={modalStudents}
        isLoading={isModalLoading} // Truyền state loading vào modal
      />

      <main className="main-content-area">
        <header className="page-header">
          <div className="breadcrumbs">{t("route.breadcrumb")}</div>
          <div className="header-actions">
            <input
              type="text"
              placeholder={t("common.search")}
              className="search-input"
            />
            <button className="user-button">{t("common.login")}</button>
          </div>
        </header>

        <div className="page-content">
          <div className="content-header">
            <h2>{t("route.title")}</h2>
            {/* <div className="header-controls">
             
              <button
                className="control-btn add-btn"
                title="Thêm tuyến đường (chưa hoạt động)"
              >
                <FaPlus />
              </button>
            </div> */}
          </div>

          {isLoading ? (
            <div className="loading-message">{t("route.loadingRoutes")}</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t("common.stt")}</th>
                    <th>{t("route.routeName")}</th>
                    <th>{t("route.stopPoints")}</th>
                    <th>{t("route.studentCount")}</th>
                    <th>{t("route.map")}</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.length > 0 ? (
                    routes.map((route) => (
                      <RouteRow
                        key={route.id}
                        route={route}
                        onViewStudents={handleViewStudents}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        {t("route.noData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Không cần Pagination nữa */}
        </div>
      </main>
    </>
  );
};

export default RouteListPage;
