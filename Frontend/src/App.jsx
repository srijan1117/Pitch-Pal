import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import BrowseFutsal from "./pages/BrowseFutsal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout.jsx";

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
        </Route>
      </Routes>
    </Router>
  );
}
