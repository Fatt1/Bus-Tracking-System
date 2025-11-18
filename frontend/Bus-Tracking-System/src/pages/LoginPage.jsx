// src/pages/LoginPage.jsx

import React, { useState } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { decodeJwt, extractRoles, setAuthInfo } from "../utils/auth";
import { useTranslation } from "react-i18next"; // Import i18n
import LanguageSwitcher from "../components/LanguageSwitcher"; // Import Language Switcher
import { BASE_URL } from "../config/apiConfig"; // THÊM: Import config

const LoginPage = () => {
  const { t } = useTranslation(); // i18n hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Cấu hình axios: baseURL và gửi cookie
      const api = axios.create({
        baseURL: BASE_URL,
        withCredentials: true,
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"  // ✅ Bypass ngrok warning
        },
      });

      // Backend dùng UserName/Password (không phải email)
      const payload = { userName: email, password };
      const res = await api.post("/api/v1/auth/login", payload);
      const data = res.data || {};

      const token = data.token || data.Token;
      const payloadObj = decodeJwt(token);
      const roles = extractRoles(payloadObj);

      // Lưu thông tin vào sessionStorage (mỗi tab độc lập)
      setAuthInfo({
        roles,
        fullName: data.fullName || data.FullName,
        userName: data.userName || data.UserName,
        token, // Lưu token để gửi trong Authorization header
      });

      // Điều hướng theo role
      if (roles.includes("Admin")) {
        navigate("/", { replace: true });
      } else if (roles.includes("Driver")) {
        navigate("/driver/home", { replace: true });
      } else if (roles.includes("Parent")) {
        navigate("/parent/home", { replace: true });
      } else {
        setError("Không xác định được quyền của tài khoản.");
      }
    } catch {
      setError("Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-header">
        <h3>Smart Bú</h3>
        <LanguageSwitcher />
      </div>
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-card-left">
            <img
              src="https://res.cloudinary.com/dn7wftowk/image/upload/v1763446901/Blakpink-Jisoo-Vogue-France-00_1_ovtql4.png"
              alt="Bus Illustration"
              className="login-illustration"
            />
          </div>
          <div className="login-card-right">
            <form onSubmit={handleLogin} className="login-form">
              <h2>{t("login.title").toUpperCase()}</h2>

              {error && (
                <div className="login-error-message">
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">{t("login.username").toUpperCase()}</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.enterUsername")}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  {t("login.password").toUpperCase()}
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("login.enterPassword")}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <button type="submit"  className="login-button" disabled={loading}>
                {loading
                  ? t("common.loading")
                  : t("login.loginButton").toUpperCase()}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
