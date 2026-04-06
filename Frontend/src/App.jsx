import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import BrowseFutsal from "./pages/BrowseFutsal";
import Bookings from "./pages/Bookings";
import FutsalDetail from "./pages/FutsalDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout.jsx";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AutoLogout from "./components/AutoLogout";

export default function App() {
  return (
    <Router>
      <AutoLogout />
      <Routes>
        {/* Auth routes — NO navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Legacy redirects */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Public + User routes — WITH navbar */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/browse" element={<BrowseFutsal />} />
          <Route path="/browse/:id" element={<FutsalDetail />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />

          {/* Bookings — requires login */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Bookings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Owner Dashboard — NO global navbar, own layout */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/*"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard — NO global navbar, own layout */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "superuser"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}