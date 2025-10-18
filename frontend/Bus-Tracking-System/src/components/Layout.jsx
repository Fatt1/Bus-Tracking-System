import React from "react";
import { Outlet } from "react-router-dom";
import { SideBar } from "./SideBar"; // Import Sidebar của bạn

// Dùng chung CSS layout từ DashboardPage để không phải viết lại
import "../pages/DashboardPage.css";

const Layout = () => {
  return (
    // Class này sẽ tạo layout 2 cột: sidebar và nội dung
    <div className="dashboard-container">
      <SideBar />

      {/* Outlet là nơi React Router sẽ render các component page con */}
      <Outlet />
    </div>
  );
};

export default Layout;
