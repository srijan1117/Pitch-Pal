import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `transition-colors ${
      isActive
        ? "text-green-600 font-semibold"
        : "text-gray-600 hover:text-green-600"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-green-50 text-green-600 font-semibold"
        : "hover:bg-green-50 text-gray-700"
    }`;

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
            <NavLink to="/home" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/browse" className={linkClass}>
              Browse Futsal Courts
            </NavLink>
            <NavLink to="/bookings" className={linkClass}>
              My Bookings
            </NavLink>
            <NavLink to="/tournaments" className={linkClass}>
              Tournaments
            </NavLink>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  Srijan Shrestha
                </p>
                <p className="text-xs text-gray-500 hover:text-green-600 cursor-pointer transition-colors">
                  View Profile
                </p>
              </div>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
            <NavLink
              to="/home"
              className={mobileLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/browse"
              className={mobileLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Futsal Courts
            </NavLink>
            <NavLink
              to="/bookings"
              className={mobileLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              My Bookings
            </NavLink>
            <NavLink
              to="/tournaments"
              className={mobileLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Tournaments
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
