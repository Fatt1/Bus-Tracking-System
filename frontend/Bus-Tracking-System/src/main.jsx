import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { NotificationProvider } from "./context/NotificationContext";
import ToastContainer from "./components/ToastContainer";
import "./i18n"; // Import i18n configuration

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <NotificationProvider>
      <App />
      <ToastContainer />
    </NotificationProvider>
  </BrowserRouter>
  // </StrictMode>
);
