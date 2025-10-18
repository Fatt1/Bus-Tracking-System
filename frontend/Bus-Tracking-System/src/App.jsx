import { Routes, Route } from "react-router-dom"; // Import từ react-router-dom
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import BusListPage from "./pages/BusListPage";
import Layout from "./components/Layout"; // Import Layout mới

function App() {
  // Xóa useEffect gọi API ở đây, logic này nên nằm trong component cần nó
  return (
    <Routes>
      {/* Route không có Sidebar (như Login) sẽ nằm ngoài */}
      <Route path="/login" element={<LoginPage />} />

      {/* Các Route CÓ Sidebar sẽ nằm bên trong Layout */}
      <Route path="/" element={<Layout />}>
        {/* 'index' có nghĩa là route mặc định "/" sẽ render DashboardPage */}
        <Route index element={<DashboardPage />} />
        <Route path="bus" element={<BusListPage />} />

        {/* Sau này bạn có thể thêm các route khác vào đây */}
        {/* <Route path="drivers" element={<DriverPage />} /> */}
        {/* <Route path="routes" element={<RoutePage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
