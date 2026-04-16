import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import logo from "../assets/logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Upper Footer: Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="flex flex-col space-y-6">
            <Link to="/home" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-lg shadow-green-900/20">
                <img src={logo} alt="PitchPal Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                PitchPal
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Nepal's premier futsal booking platform. We connect enthusiasts with the best pitches, managing games and tournaments with seamless ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { label: "Home", to: "/home" },
                { label: "Browse Futsal", to: "/browse" },
                { label: "Tournaments", to: "/tournaments" },
                { label: "Bookings", to: "/bookings" },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="flex items-center group text-sm hover:text-green-500 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 text-green-600 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              Support
            </h3>
            <ul className="space-y-4">
              {["Help Center", "Privacy Policy", "Terms of Service", "FAQ"].map((label) => (
                <li key={label}>
                  <button className="flex items-center group text-sm hover:text-green-500 transition-colors">
                    <ChevronRight className="w-4 h-4 mr-2 text-green-600 group-hover:translate-x-1 transition-transform" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-gray-400">
                  Kathmandu, Nepal <br />
                  Bagmati Province
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-gray-400">+977 9801234567</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-gray-400">contact@pitchpal.com.np</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} PitchPal. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500 uppercase tracking-widest font-bold">
            <span className="cursor-pointer hover:text-green-500 transition-colors">Safety</span>
            <span className="cursor-pointer hover:text-green-500 transition-colors">Guidelines</span>
            <span className="cursor-pointer hover:text-green-500 transition-colors">Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}