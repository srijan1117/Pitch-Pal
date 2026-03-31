import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ProfileModal } from "./ProfileModal";
import LogoutConfirmationModal from "./LogoutConfirmationModal";
import { clearSession, isLoggedIn } from "../api/auth";
import api from "../api/axios";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  // Fetch logged-in user info
  useEffect(() => {
    if (!loggedIn) return;
    api.get("/accounts/user/profile/")
      .then(res => {
        const profile = res.data?.Result;
        // Also get email from token stored role
        const email = localStorage.getItem("email") || "";
        const role = localStorage.getItem("role") || "";
        setUser({ email, role, ...profile });
      })
      .catch(() => {
        const email = localStorage.getItem("email") || "";
        const role = localStorage.getItem("role") || "";
        setUser({ email, role });
      });
  }, [loggedIn]);

  const handleLogout = () => {
    clearSession();
    setIsProfileOpen(false);
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `transition-colors ${isActive ? "text-green-600 font-semibold" : "text-gray-600 hover:text-green-600"}`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg transition-colors ${isActive ? "bg-green-50 text-green-600 font-semibold" : "hover:bg-green-50 text-gray-700"}`;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/home" className="flex-shrink-0">
            <div className="w-16 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">PP</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/home" className={linkClass}>Home</NavLink>
            <NavLink to="/browse" className={linkClass}>Browse Futsal Courts</NavLink>
            {loggedIn && (
              <NavLink to="/bookings" className={linkClass}>My Bookings</NavLink>
            )}
            <NavLink to="/tournaments" className={linkClass}>Tournaments</NavLink>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {loggedIn ? (
              <div className="hidden md:flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:ring-2 group-hover:ring-green-500 transition-all">
                  <span className="text-green-700 font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors truncate max-w-[150px]">
                    {user?.email || "User"}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="text-xs text-gray-500 hover:text-green-600 transition-colors"
                    >
                      View Profile
                    </button>
                    <span className="text-xs text-gray-300">|</span>
                    <button
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  Register
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
            <NavLink to="/home" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/browse" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Browse Futsal Courts</NavLink>
            {loggedIn && (
              <NavLink to="/bookings" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>My Bookings</NavLink>
            )}
            <NavLink to="/tournaments" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Tournaments</NavLink>

            {loggedIn ? (
              <>
                <button
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-green-50 text-gray-700"
                  onClick={() => { setIsMenuOpen(false); setIsProfileOpen(true); }}
                >
                  View Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-red-50 text-red-600 font-medium"
                  onClick={() => { setIsMenuOpen(false); setIsLogoutModalOpen(true); }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block px-4 py-2 rounded-lg bg-green-600 text-white" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>

      {isProfileOpen && <ProfileModal close={() => setIsProfileOpen(false)} />}

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </nav>
  );
}