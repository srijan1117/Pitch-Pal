import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoutConfirmationModal from "../components/LogoutConfirmationModal";
import { LogOut, Users, Building2, MapPin, Calendar, FileText, AlertCircle, ShieldCheck, Menu, X } from "lucide-react";
import { clearSession } from "../api/auth";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const stats = [
    { title: "Total Users", value: "124", icon: <Users className="w-5 h-5" /> },
    { title: "Total Owners", value: "18", icon: <Building2 className="w-5 h-5" /> },
    { title: "Active Venues", value: "31", icon: <MapPin className="w-5 h-5" /> },
    { title: "Total Bookings Today", value: "56", icon: <Calendar className="w-5 h-5" /> },
  ];

  const recentOwners = [
    { id: 1, name: "Hari Bahadur", venue: "Kathmandu Futsal Hub", joined: "2023-10-12", status: "Active" },
    { id: 2, name: "Ram Shrestha", venue: "Lalitpur Sports Arena", joined: "2023-10-15", status: "Active" },
    { id: 3, name: "Sita Karki", venue: "Bhaktapur Kickoff", joined: "2023-10-20", status: "Suspended" },
    { id: 4, name: "Gita Magar", venue: "Patan Indoor FC", joined: "2023-10-22", status: "Active" },
  ];

  const flaggedBookings = [
    { id: "BK-4092", user: "John Doe", reason: "Multiple no-shows reported" },
    { id: "BK-4105", user: "Jane Smith", reason: "Payment dispute pending" },
    { id: "BK-4118", user: "Mike Johnson", reason: "System error during payment" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-slate-900 text-white flex-col shrink-0">
        <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span>Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-indigo-600 rounded-lg text-white shadow-sm">
            <LayoutDashboardIcon className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            <Users className="w-5 h-5" />
            <span>Users</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            <Building2 className="w-5 h-5" />
            <span>Owners</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            <MapPin className="w-5 h-5" />
            <span>Venues</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            <Calendar className="w-5 h-5" />
            <span>Bookings</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            <FileText className="w-5 h-5" />
            <span>Reports</span>
          </a>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Owners Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-white flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Recent Owners</h2>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium font-sans">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Owner Name</th>
                      <th className="px-6 py-4 font-medium">Venue Name</th>
                      <th className="px-6 py-4 font-medium">Joined Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {recentOwners.map((owner) => (
                      <tr key={owner.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 text-gray-800 font-medium flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                {owner.name.charAt(0)}
                            </div>
                            <span>{owner.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{owner.venue}</td>
                        <td className="px-6 py-4 text-gray-600">{owner.joined}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            owner.status === "Active" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {owner.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Flagged Bookings Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-500"/>
                    <span>Flagged Bookings</span>
                </h2>
              </div>
              <div className="p-6 space-y-4 flex-1">
                {flaggedBookings.map((bk) => (
                  <div key={bk.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-sm">{bk.id}</h3>
                      <span className="text-xs text-gray-500 font-medium">{bk.user}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{bk.reason}</p>
                    <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition">
                        Review Case
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl transform transition-transform duration-300">
            <div className="p-6 text-xl font-bold border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                <span>Admin</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-600 rounded-lg text-white shadow-sm">
                <LayoutDashboardIcon className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
                <Users className="w-5 h-5" />
                <span>Users</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
                <Building2 className="w-5 h-5" />
                <span>Owners</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
                <MapPin className="w-5 h-5" />
                <span>Venues</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition">
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
// Placeholder icon not natively imported above to prevent breaking, easily fixable by standardizing imports.
function LayoutDashboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
