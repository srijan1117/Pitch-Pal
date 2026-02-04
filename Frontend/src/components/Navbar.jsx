import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/home" className="flex-shrink-0">
            <div className="w-16 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">PP</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/home" className="text-gray-900 font-semibold hover:text-green-600">Home</Link>
            <Link to="/browse" className="text-gray-600 hover:text-green-600">Browse Futsal Courts</Link>
            <Link to="/bookings" className="text-gray-600 hover:text-green-600">My Bookings</Link>
            <Link to="/tournaments" className="text-gray-600 hover:text-green-600">Tournaments</Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Srijan Shrestha</p>
                <p className="text-xs text-gray-500 hover:text-green-600 cursor-pointer transition-colors">
                  View Profile
                </p>
              </div>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
            <Link to="/home" className="block px-4 py-2 hover:bg-green-50 rounded-lg">Home</Link>
            <Link to="/browse" className="block px-4 py-2 hover:bg-green-50 rounded-lg">Browse Futsal Courts</Link>
            <Link to="/bookings" className="block px-4 py-2 hover:bg-green-50 rounded-lg">My Bookings</Link>
            <Link to="/tournaments" className="block px-4 py-2 hover:bg-green-50 rounded-lg">Tournaments</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
