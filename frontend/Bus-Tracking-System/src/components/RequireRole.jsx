import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthRoles } from "../utils/auth";

const RequireRole = ({ roles, children }) => {
  const location = useLocation();
  const userRoles = getAuthRoles();
  const isAllowed = roles?.some((r) => userRoles.includes(r));

  if (!isAllowed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export default RequireRole;
