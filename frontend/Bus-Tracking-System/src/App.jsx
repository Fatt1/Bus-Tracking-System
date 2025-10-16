// src/App.jsx
import { Routes, Route } from "react-router";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { useEffect } from "react";
import axios from "axios";
import BusListPage from "./pages/BusListPage";

function App() {
  useEffect(() => {
    const getHomeData = async () => {
      const response = await axios.get(
        "https://localhost:7229/api/v1/route/all"
      );
      console.log(response);
    };
    getHomeData();
  }, []);
  return (
    <>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="bus" element={<BusListPage />} />
      </Routes>
    </>
  );
}

export default App;
