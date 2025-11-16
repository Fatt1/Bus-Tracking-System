import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import * as signalR from "@microsoft/signalr";
import { getAuthToken, getCurrentUserId } from "../utils/auth";
import axios from "axios";
import { API_BASE_URL, NOTIFICATION_HUB_URL } from "../config/apiConfig"; // THÊM: Import config

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

// Helper to create axios instance
const createAPI = () =>
  axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"  // ✅ Bypass ngrok warning
    },
  });

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]); // Toast queue
  const [unreadCount, setUnreadCount] = useState(0); // Unread notification count
  const [isSignalRConnected, setIsSignalRConnected] = useState(false); // SignalR connection status
  const connectionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const recentlySentRef = useRef([]); // Track recently sent notifications with timestamp [{key, timestamp}]

  // Fetch unread count from backend
  const fetchUnreadCount = useCallback(async () => {
    try {
      const api = createAPI();
      const response = await api.get("/notificaton/received-notifications");
      const notifications = response.data || [];
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
      console.log("📬 Fetched unread count:", unread);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  // Add toast to queue (max 5 toasts)
  const addToast = useCallback((toast) => {
    const newToast = {
      id: Date.now() + Math.random(),
      ...toast,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    console.log("🔔 Adding toast:", newToast);

    setToasts((prev) => {
      // Keep only last 5 toasts
      const updated = [...prev, newToast].slice(-5);
      return updated;
    });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3000);
  }, []);

  // Remove toast manually
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Setup SignalR connection
  const setupSignalRConnection = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      console.log("⚠️ No auth token - skipping SignalR connection");
      return;
    }

    // Prevent duplicate connections (for React StrictMode in dev)
    if (connectionRef.current) {
      console.log("⚠️ SignalR connection already exists, skipping setup");
      return connectionRef.current;
    }

    console.log("🔌 Setting up SignalR connection...");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(NOTIFICATION_HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => {
          // Retry after 2, 5, 10 seconds
          return [2000, 5000, 10000][Math.floor(Math.random() * 3)];
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Listen for notifications
    connection.on("ReceiveNotification", (notification) => {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║          🔔 RECEIVED NOTIFICATION FROM BACKEND            ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log("📩 Full notification object:", notification);
      console.log("📌 Title:", notification.Title || notification.title);
      console.log("📝 Message:", notification.Message || notification.message);
      console.log("🏷️ Type:", notification.NotificationType || notification.notificationType);
      console.log("👤 Current User ID:", getCurrentUserId());
      console.log("🔍 Recently sent by me:", recentlySentRef.current);
      console.log("════════════════════════════════════════════════════════════");

      const title = notification.Title || notification.title || "Thông báo mới";
      const message = notification.Message || notification.message || "";
      const notificationKey = `${title}|${message}`; // Create unique key
      const currentUserId = getCurrentUserId();

      console.log("🔑 Notification key:", notificationKey);

      // Clean up old entries (older than 3 seconds)
      const now = Date.now();
      recentlySentRef.current = recentlySentRef.current.filter(
        (item) => now - item.timestamp < 3000
      );

      // Check if THIS USER recently sent this exact notification (within last 3 seconds)
      const isRecentlySentByMe = recentlySentRef.current.some(
        (item) => item.key === notificationKey && item.userId === currentUserId
      );

      if (isRecentlySentByMe) {
        console.log(
          "⏭️ Skipping toast - this user sent it recently:",
          notificationKey
        );
        // Still increment unread count (backend should not send to sender, but just in case)
        setUnreadCount((prev) => prev + 1);
        return;
      }

      console.log("✅ Showing toast for notification");

      // Add toast popup
      addToast({
        title,
        message,
        type:
          notification.NotificationType || notification.notificationType || 0,
      });

      // Increment unread count
      setUnreadCount((prev) => prev + 1);
    });

    connection.onreconnecting((error) => {
      console.log("🔄 SignalR reconnecting...", error);
      setIsSignalRConnected(false);
    });

    connection.onreconnected((connectionId) => {
      console.log("✅ SignalR reconnected. Connection ID:", connectionId);
      setIsSignalRConnected(true);
      // Fetch latest unread count after reconnect
      fetchUnreadCount();
    });

    connection.onclose((error) => {
      console.log("❌ SignalR connection closed:", error);
      // Mark disconnected and clear ref so we can reconnect later
      setIsSignalRConnected(false);
      connectionRef.current = null;
      // Attempt to reconnect after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("🔄 Attempting to reconnect SignalR...");
        setupSignalRConnection();
      }, 5000);
    });

    // Start connection
    connection
      .start()
      .then(() => {
        const userId = getCurrentUserId();
        const userRole = sessionStorage.getItem("userRole") || "Unknown";
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║          ✅ SignalR CONNECTED SUCCESSFULLY!               ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("📍 User Role:", userRole);
        console.log("📍 User ID:", userId);
        console.log("🔌 Connection ID:", connection.connectionId);
        console.log("🔑 JWT Token (first 50 chars):", getAuthToken()?.substring(0, 50) + "...");
        console.log("🎯 Hub URL:", NOTIFICATION_HUB_URL);
        console.log("⚠️ IMPORTANT: Backend will send notifications to userId:", userId);
        console.log("📡 Listening for 'ReceiveNotification' events...");
        console.log("════════════════════════════════════════════════════════════");
        setIsSignalRConnected(true);
        connectionRef.current = connection;
        // Fetch initial unread count
        fetchUnreadCount();
      })
      .catch((err) => {
        console.error("❌ SignalR connection failed:", err);
        // Retry after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Retrying SignalR connection...");
          setupSignalRConnection();
        }, 5000);
      });

    return connection;
  }, [addToast, fetchUnreadCount]);

  // Initialize SignalR on mount
  useEffect(() => {
    const connection = setupSignalRConnection();

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up SignalR connection...");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (connection) {
        connection
          .stop()
          .catch((err) => console.error("Error stopping SignalR:", err));
      }
    };
  }, [setupSignalRConnection]);

  // Listen for auth login/logout events to (re)initialize SignalR on the fly
  useEffect(() => {
    const handleLogin = () => {
      console.log("🔐 auth:login received - ensuring SignalR connection");
      if (!connectionRef.current) {
        setupSignalRConnection();
      } else {
        console.log("🔁 SignalR already connected or connecting");
      }
      // Refresh unread count after login
      fetchUnreadCount();
    };

    const handleLogout = () => {
      console.log("🔓 auth:logout received - tearing down SignalR");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (connectionRef.current) {
        connectionRef.current
          .stop()
          .catch((err) => console.error("Error stopping SignalR:", err));
        connectionRef.current = null;
      }
      setIsSignalRConnected(false);
      setUnreadCount(0);
    };

    window.addEventListener("auth:login", handleLogin);
    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:login", handleLogin);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [fetchUnreadCount, setupSignalRConnection]);

  // Fallback: periodic check to start SignalR once token becomes available
  useEffect(() => {
    const interval = setInterval(() => {
      const hasToken = !!getAuthToken();
      if (hasToken && !connectionRef.current) {
        console.log("⏰ Periodic check: token available, starting SignalR");
        setupSignalRConnection();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [setupSignalRConnection]);

  // Function to refresh unread count (can be called from NotificationPage)
  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Function to mark a notification as "recently sent" to avoid showing toast
  const markAsRecentlySent = useCallback((title, message) => {
    const notificationKey = `${title}|${message}`;
    const currentUserId = getCurrentUserId();

    console.log("🚫 Marking as recently sent:", notificationKey);
    console.log("👤 Current User ID:", currentUserId);

    // Add to array with timestamp and userId
    recentlySentRef.current.push({
      key: notificationKey,
      timestamp: Date.now(),
      userId: currentUserId, // Store sender's userId
    });

    console.log("📝 Recently sent list updated:", recentlySentRef.current);
  }, []);

  const value = {
    toasts,
    unreadCount,
    addToast,
    removeToast,
    refreshUnreadCount,
    markAsRecentlySent, // Export this function
    isSignalRConnected, // Export connection status
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
