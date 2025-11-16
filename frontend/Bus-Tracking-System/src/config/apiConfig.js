// API Configuration - Cấu hình URL backend tập trung
// Chỉ cần đổi BASE_URL ở đây khi deploy lên server thật

// URL của backend API
// export const BASE_URL = "https://swearingly-pseudocubic-beth.ngrok-free.dev";
export const BASE_URL = "https://localhost:7229";

// URL của SignalR Hubs
export const GEOLOCATION_HUB_URL = `${BASE_URL}/geolocationHub`;
export const NOTIFICATION_HUB_URL = `${BASE_URL}/notificationHub`;

// API endpoints prefix
export const API_PREFIX = "/api/v1";

// Full API base URL
export const API_BASE_URL = `${BASE_URL}${API_PREFIX}`;

// Export default config object
const apiConfig = {
  baseURL: BASE_URL,
  geolocationHubURL: GEOLOCATION_HUB_URL,
  notificationHubURL: NOTIFICATION_HUB_URL,
  apiPrefix: API_PREFIX,
  apiBaseURL: API_BASE_URL,
};

export default apiConfig;
