import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import BusListPage from "./pages/BusListPage";
import BusDetailPage from "./pages/BusDetailPage";
import Layout from "./components/Layout"; // <-- 1. IMPORT LAYOUT
// import ScheduleListPage from "./pages/ScheduleListPageNew";
import TripListPage from "./pages/TripListPage";
// import ScheduleAddEditPage from "./pages/ScheduleAddEditPage";
import StudentListPage from "./pages/StudentListPage";
import DriverListPage from "./pages/DriverListPage";
import RouteListPage from "./pages/RouteListPage";

import ScheduleListPageNew from "./pages/ScheduleListPageNew";
import ScheduleAddEditPageNew from "./pages/ScheduleAddEditPageNew";
import { useEffect } from "react";
import axios from "axios";
import NotificationPage from "./pages/NotificationPage";

import DriverHomePage from "./pages/driver/DriverHomePage";
import DriverSchedulePage from "./pages/driver/DriverSchedulePage";
import DriverNotificationPage from "./pages/driver/DriverNotificationPage";
import RequireRole from "./components/RequireRole";

function App() {
  // Xóa useEffect gọi API ở đây, nó nên nằm trong component cần dữ liệu (DashboardPage)
  const loadCart = async () => {
    const response = await axios.get(
      "https://localhost:7229/api/v1/bus/dropdown"
    );
    console.log(response);
  };
  useEffect(() => {
    loadCart();
  }, []);
  return (
    <Routes>
      {/* Route không có Sidebar Admin (ví dụ Login, Trang tài xế) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/schedules/add-new" element={<ScheduleAddEditPageNew />} />

      {/* 2. TRANG TÀI XẾ - CHỈ DÀNH CHO ROLE Driver */}
      <Route
        path="/driver/home"
        element={
          <RequireRole roles={["Driver"]}>
            <DriverHomePage />
          </RequireRole>
        }
      />
      <Route
        path="/driver/schedule"
        element={
          <RequireRole roles={["Driver"]}>
            <DriverSchedulePage />
          </RequireRole>
        }
      />
      <Route
        path="/driver/notifications"
        element={
          <RequireRole roles={["Driver"]}>
            <DriverNotificationPage />
          </RequireRole>
        }
      />

      {/* Các Route CÓ Sidebar Admin - CHỈ DÀNH CHO ROLE Admin */}
      <Route
        path="/"
        element={
          <RequireRole roles={["Admin"]}>
            <Layout />
          </RequireRole>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="bus" element={<BusListPage />} />
        <Route path="bus/:busId" element={<BusDetailPage />} />
        <Route path="schedules-calendar" element={<ScheduleListPageNew />} />
        <Route path="schedule-trips" element={<TripListPage />} />
        <Route path="schedule" element={<ScheduleListPageNew />} />

        <Route path="schedules/add-new" element={<ScheduleAddEditPageNew />} />
        <Route path="students" element={<StudentListPage />} />
        <Route path="drivers" element={<DriverListPage />} />
        <Route path="routes" element={<RouteListPage />} />
        <Route path="notification" element={<NotificationPage />} />
      </Route>
    </Routes>
  );
}

export default App;
