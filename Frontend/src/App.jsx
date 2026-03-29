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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (NO navbar) */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes (WITH navbar) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/browse" element={<BrowseFutsal />} />
          <Route path="/browse/:id" element={<FutsalDetail />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
