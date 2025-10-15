// src/pages/LoginPage.jsx

import React, { useState } from "react";
import "./LoginPage.css"; // Sẽ tạo file này ở bước tiếp theo
import { FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa"; // Cần cài react-icons

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State để ẩn/hiện mật khẩu
  const [error, setError] = useState(""); // State để hiển thị lỗi

  const handleLogin = (e) => {
    e.preventDefault(); // Ngăn chặn reload trang khi submit form
    setError(""); // Xóa lỗi cũ khi thử đăng nhập lại

    // DỮ LIỆU MẪU: Đăng nhập đơn giản cho mục đích demo
    // Thực tế: Bạn sẽ gọi API tới backend ở đây
    if (email === "admin@example.com" && password === "password123") {
      alert("Đăng nhập thành công!");
      // Chuyển hướng người dùng về trang chủ (Dashboard)
      // (Bạn sẽ cần cài đặt React Router để xử lý việc chuyển hướng này một cách đúng đắn)
      window.location.href = "/dashboard"; // Tạm thời dùng cách này
    } else {
      setError(
        "Tên đăng nhập hoặc mật khẩu không đúng với tài khoản, vui lòng thử lại"
      );
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-header">
        <h3>36 36 BUS BUS</h3>
      </div>
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-card-left">
            {/* Ảnh trang trí bên trái */}
            {/* Lưu ý: Đường dẫn ảnh cần đúng với vị trí bạn lưu */}
            <img
              src="/src/assets/login-image.jpg"
              alt="Bus Illustration"
              className="login-illustration"
            />
          </div>
          <div className="login-card-right">
            <form onSubmit={handleLogin} className="login-form">
              <h2>ĐĂNG NHẬP</h2>

              {error && (
                <div className="login-error-message">
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">EMAIL</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">MẬT KHẨU</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {/* <span className="password-hint">Vui lòng điền lộ mục này</span> */}{" "}
                {/* Nếu muốn hiển thị hint */}
              </div>

              <button type="submit" className="login-button">
                ĐĂNG NHẬP
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
