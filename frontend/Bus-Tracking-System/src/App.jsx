// src/App.jsx
import { Routes, Route } from "react-router";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <>
      {/*  */}

      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route index element={<DashboardPage />} />
      </Routes>
    </>
  );
}

export default App;
