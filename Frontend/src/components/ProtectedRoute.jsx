import { Navigate, Outlet } from "react-router-dom";
import { isSessionExpired, clearSession } from "../api/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  if (isSessionExpired()) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("role")?.toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    return <Navigate to="/home" replace />;
  }

  return children ? children : <Outlet />;
}
