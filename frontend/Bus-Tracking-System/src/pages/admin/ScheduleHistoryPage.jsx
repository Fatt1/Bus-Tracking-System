import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation, Link } from "react-router-dom";
import api from "../../utils/api"; // Import api instance với token support
import "./ScheduleHistoryPage.css"; // Sẽ tạo ở bước 2
import "../LayoutTable.css"; // Tái sử dụng CSS bảng
import { FaAngleLeft, FaSpinner } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

// Component Bảng học sinh
const StudentTable = ({ students, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="table-container student-history-table">
        <div className="loading-message">
          <FaSpinner className="spinner" />{" "}
          {t("scheduleHistory.loadingStudents")}
        </div>
      </div>
    );
  }

  return (
    <div className="table-container student-history-table">
      <table>
        <thead>
          <tr>
            <th>{t("common.stt")}</th>
            <th>{t("scheduleHistory.studentName")}</th>
            <th>{t("scheduleHistory.pickupPoint")}</th>
            <th>{t("common.status")}</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student, index) => {
              // Map status từ API: "PickedUp", "Absent", v.v.
              const getStatusClass = (status) => {
                if (status === "PickedUp") return "status-active"; // Đã đón - xanh
                if (status === "Absent") return "status-finished"; // Vắng - đỏ
                return "status-default"; // Mặc định
              };
              const getStatusText = (status) => {
                if (status === "PickedUp") return t("scheduleHistory.pickedUp");
                if (status === "Absent") return t("scheduleHistory.absent");
                return status; // Trả về nguyên nếu không match
              };

              return (
                <tr key={student.studentId}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{student.studentName}</td>
                  <td>{student.stopPointName}</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        student.status
                      )}`}
                    >
                      {getStatusText(student.status)}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                {t("scheduleHistory.noStudents")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- Component chính của trang ---
const TripHistoryPage = () => {
  const { t } = useTranslation();
  const { tripId } = useParams(); // Lấy schedule ID từ URL
  const location = useLocation(); // Lấy state từ navigation
  const [scheduleData, setScheduleData] = useState(null); // Dữ liệu schedule từ API
  const [studentList, setStudentList] = useState([]); // Danh sách học sinh
  const [tripType, setTripType] = useState(1); // 1 = Outbound (đưa đi), 2 = Inbound (đón về)
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Lấy thông tin từ location.state (nếu có)
  const scheduleFromState = location.state?.schedule;
  const routeNameFromState = location.state?.routeName;

  // Hàm gọi API lấy lịch sử checking
  const fetchScheduleHistory = async (scheduleId, direction) => {
    console.log(
      `Fetching schedule history for ID: ${scheduleId}, Direction: ${direction}`
    );
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/api/v1/schedule/${scheduleId}/cheking-history`,
        {
          params: { direction: direction }, // 1 = Outbound, 2 = Inbound
        }
      );
      console.log("Schedule history API response:", response.data);
      setScheduleData(response.data);
      setStudentList(response.data.studentCheckingHistories || []);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử lịch trình:", err);
      setError("Không thể tải lịch sử lịch trình.");
      setScheduleData(null);
      setStudentList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để fetch data khi component mount hoặc khi tripType thay đổi
  useEffect(() => {
    if (tripId) {
      fetchScheduleHistory(tripId, tripType);
    }
  }, [tripId, tripType]); // Fetch lại khi tripType thay đổi

  // Format ngày tháng (lấy từ state hoặc scheduleData)
  const scheduleDate =
    scheduleFromState?.scheduleDate || scheduleData?.scheduleDate;
  const formattedDate = scheduleDate
    ? format(parseISO(scheduleDate), "EEEE, dd 'tháng' MM 'năm' yyyy", {
        locale: vi,
      })
    : "N/A";

  // Hiển thị loading hoặc error
  if (isLoading && !scheduleData) {
    return (
      <main className="main-content-area">
        <div className="loading-message">
          <FaSpinner className="spinner" /> {t("common.loading")}
        </div>
      </main>
    );
  }

  if (error && !scheduleData) {
    return (
      <main className="main-content-area">
        <div className="error-message">{error}</div>
      </main>
    );
  }

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <Link to="/schedule-trips" className="back-link">
            <FaAngleLeft /> {t("scheduleHistory.backToList")}
          </Link>
          / <span>{t("scheduleHistory.tripHistory")}</span>
        </div>
        {/* Header actions (nếu cần) */}
      </header>

      <div className="page-content trip-history-page">
        {/* Tiêu đề trang */}
        <div className="history-header">
          <h2>{routeNameFromState || t("route.routeName")}</h2>
          <span className="history-date">{formattedDate}</span>
        </div>

        {/* Form thông tin (chỉ đọc) */}
        <form className="history-form-container">
          <div className="history-form-row">
            <div className="form-group readonly-group">
              <label>{t("scheduleHistory.departureTime")}</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={
                    scheduleData?.pickupTime
                      ? scheduleData.pickupTime.substring(0, 5)
                      : "--:--"
                  }
                  readOnly
                />
              </div>
            </div>
            <div className="form-group readonly-group">
              <label>{t("scheduleHistory.returnTime")}</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={
                    scheduleData?.dropOffTime
                      ? scheduleData.dropOffTime.substring(0, 5)
                      : "--:--"
                  }
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="history-form-row">
            <div className="form-group readonly-group">
              <label>{t("scheduleHistory.driver")}</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={scheduleData?.driverName || "N/A"}
                  readOnly
                />
              </div>
            </div>
            <div className="form-group readonly-group">
              <label>{t("scheduleHistory.bus")}</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={scheduleData?.busName || "N/A"}
                  readOnly
                />
              </div>
            </div>
          </div>
        </form>

        {/* Phần danh sách học sinh */}
        <div className="student-list-section">
          <div className="student-list-header">
            <h4>{t("scheduleHistory.studentHistory")}</h4>
            <div className="form-group">
              <label htmlFor="tripType">{t("scheduleHistory.type")}</label>
              <select
                id="tripType"
                value={tripType}
                onChange={(e) => setTripType(parseInt(e.target.value))}
              >
                <option value={1}>{t("scheduleHistory.outbound")}</option>
                <option value={2}>{t("scheduleHistory.inbound")}</option>
              </select>
            </div>
          </div>
          <StudentTable students={studentList} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
};

export default TripHistoryPage;
