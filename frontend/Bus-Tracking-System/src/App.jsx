import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import BusListPage from "./pages/BusListPage";
import BusDetailPage from "./pages/BusDetailPage";
import Layout from "./components/Layout"; // <-- 1. IMPORT LAYOUT
import ScheduleListPage from "./pages/ScheduleListPage";
import TripListPage from "./pages/TripListPage";
import ScheduleAddEditPage from "./pages/ScheduleAddEditPage";

function App() {
  // Xóa useEffect gọi API ở đây, nó nên nằm trong component cần dữ liệu (DashboardPage)
  return (
    <Routes>
      {/* Route không có Sidebar (như Login) sẽ nằm ngoài Layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Các Route CÓ Sidebar sẽ nằm bên trong Layout */}
      <Route path="/" element={<Layout />}>
        {/* 'index' có nghĩa là route mặc định "/" sẽ render DashboardPage */}
        <Route index element={<DashboardPage />} />

        {/* Route cho danh sách xe buýt */}
        <Route path="bus" element={<BusListPage />} />

        {/* Route động cho trang chi tiết */}
        <Route path="bus/:busId" element={<BusDetailPage />} />

        <Route path="schedule" element={<ScheduleListPage />} />

        <Route path="schedule-trips" element={<TripListPage />} />

        <Route path="schedule/add-schedule" element={<ScheduleAddEditPage />} />

        {/* Sau này bạn có thể thêm các route khác vào đây */}
        {/* <Route path="drivers" element={<DriverPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
