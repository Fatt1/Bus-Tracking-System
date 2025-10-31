import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import BusListPage from "./pages/BusListPage";
import BusDetailPage from "./pages/BusDetailPage";
import Layout from "./components/Layout"; // <-- 1. IMPORT LAYOUT
// import ScheduleListPage from "./pages/ScheduleListPageNew";
// import TripListPage from "./pages/TripListPage";
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
import React from "react";
import DriverNotificationPage from "./pages/driver/DriverNotificationPage";
import RequireRole from "./components/RequireRole";
import TripHistoryPage from "./pages/ScheduleHistoryPage";
import DriverStudentListPage from "./pages/driver/DriverStudentListPage";
import ParentHomePage from "./pages/parent/ParentHomePage";
import ParentNotificationPage from "./pages/parent/ParentNotificationPage";
import ParentTrackingMapPage from "./pages/parent/ParentTrackingMapPage";
import BusSimulationManager from "./utils/BusSimulationManager";

function App() {
  // Resume BusSimulationManager FE khi app mount (reload/mở lại tab)
  React.useEffect(() => {
    console.log("🔄 App.jsx: Checking BusSimulationManager state...");
    console.log("   - Manager exists:", !!BusSimulationManager);
    console.log("   - Manager.state:", BusSimulationManager?.state);
    console.log("   - isRunning:", BusSimulationManager?.isRunning);
    
    // BusSimulationManager tự động resume trong constructor nếu có state
    // Không cần gọi resumeSimulation() ở đây nữa
    if (BusSimulationManager && BusSimulationManager.state && BusSimulationManager.state.busId) {
      console.log("✅ App.jsx: BusSimulationManager has state, should be running");
    } else {
      console.log("⭕ App.jsx: No simulation state to resume");
    }
  }, []);
  
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
      <Route
        path="/driver/students"
        element={
          <RequireRole roles={["Driver"]}>
            <DriverStudentListPage />
          </RequireRole>
        }
      />

      {/* 3. TRANG PHỤ HUYNH - CHỈ DÀNH CHO ROLE Parent */}
      <Route
        path="/parent/home"
        element={
          <RequireRole roles={["Parent"]}>
            <ParentHomePage />
          </RequireRole>
        }
      />
      <Route
        path="/parent/notifications"
        element={
          <RequireRole roles={["Parent"]}>
            <ParentNotificationPage />
          </RequireRole>
        }
      />
      <Route
        path="/parent/map"
        element={
          <RequireRole roles={["Parent"]}>
            <ParentTrackingMapPage />
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
        {/* <Route path="schedule-trips" element={<Schedule />} /> */}
        <Route path="schedule" element={<ScheduleListPageNew />} />
        <Route path="schedule/add" element={<ScheduleAddEditPageNew />} />
        <Route path="schedule/history/:tripId" element={<TripHistoryPage />} />
        <Route path="students" element={<StudentListPage />} />
        <Route path="drivers" element={<DriverListPage />} />
        <Route path="routes" element={<RouteListPage />} />
        <Route path="notification" element={<NotificationPage />} />
      </Route>
    </Routes>
  );
}

export default App;
