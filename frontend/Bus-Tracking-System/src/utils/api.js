import axios from "axios";

// Axios instance với withCredentials để gửi JWT cookie
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

export default api;
