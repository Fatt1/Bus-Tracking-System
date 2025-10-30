import axios from "axios";
import { getAuthToken } from "./auth";

// Axios instance với withCredentials để gửi JWT cookie
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
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
