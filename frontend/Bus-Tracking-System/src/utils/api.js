import axios from "axios";
import { getAuthToken } from "./auth";
import { BASE_URL } from "../config/apiConfig";

// Axios instance với withCredentials để gửi JWT cookie
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'ngrok-skip-browser-warning': 'true',  // ✅ Bypass ngrok warning page
  }
});

// Interceptor để tự động thêm token từ sessionStorage vào header
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
