import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LogoutConfirmationModal from "../components/LogoutConfirmationModal";
import { LogOut, Home, Calendar, LayoutDashboard, Clock, DollarSign, Menu, X, Loader2 } from "lucide-react";
import { clearSession } from "../api/auth";
import api from "../api/axios";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [courtsRes, bookingsRes] = await Promise.all([
          api.get("/futsal/courts/mine/"),
          api.get("/futsal/bookings/owner/")
        ]);

        if (courtsRes.data.is_success) {
          setCourts(courtsRes.data.Result);
        }
        if (bookingsRes.data.is_success) {
          setBookings(bookingsRes.data.Result);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  // Calculate dynamic stats
  const totalCourts = courts.length;
  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => b.booking_date === today).length;
  const pendingRequests = bookings.filter(b => b.status === "Pending").length;
  
  // Calculate monthly revenue (simple sum of all successful bookings for now)
  const totalRevenue = bookings
    .filter(b => b.status === "Confirmed" || b.status === "Completed")
    .reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);

  const stats = [
    { title: "Total Courts", value: totalCourts.toString(), icon: <Home className="w-5 h-5" /> },
    { title: "Today's Bookings", value: todaysBookings.toString(), icon: <Calendar className="w-5 h-5" /> },
    { title: "Pending Requests", value: pendingRequests.toString(), icon: <Clock className="w-5 h-5" /> },
    { title: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" /> },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md border border-red-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Uploading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-slate-800 text-white flex-col shrink-0">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          Owner Portal
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-slate-700 rounded-lg text-white">
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
            <Home className="w-5 h-5" />
            <span>My Courts</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
            <Calendar className="w-5 h-5" />
            <span>Bookings</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
            <Clock className="w-5 h-5" />
            <span>Schedule</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
            <DollarSign className="w-5 h-5" />
            <span>Earnings</span>
          </a>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Owner Dashboard</h1>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
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
            {/* Recent Bookings Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm">
                      <th className="px-6 py-4 font-medium">Court Name</th>
                      <th className="px-6 py-4 font-medium">Player Name</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Time Slot</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {bookings.slice(0, 10).map((bk) => (
                      <tr key={bk.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-800 font-medium">{bk.court_name}</td>
                        <td className="px-6 py-4 text-gray-600">{bk.user_email}</td>
                        <td className="px-6 py-4 text-gray-600">{bk.booking_date}</td>
                        <td className="px-6 py-4 text-gray-600">{bk.time_slot_detail.start_time} - {bk.time_slot_detail.end_time}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            bk.status === "Confirmed" ? "bg-green-100 text-green-700" :
                            bk.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {bk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* My Courts Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">My Courts</h2>
              <div className="space-y-4">
                 {courts.map((court) => (
                  <div key={court.id} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{court.name}</h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                        court.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                      }`}>
                        {court.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Rs. {parseFloat(court.price_per_hour).toLocaleString()} / hr</p>
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
          <div className="relative w-64 bg-slate-800 text-white flex flex-col h-full shadow-2xl transform transition-transform duration-300">
            <div className="p-6 text-xl font-bold border-b border-slate-700 flex justify-between items-center">
              <span>Owner Portal</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {/* Copying the navigation links for mobile menu */}
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-700 rounded-lg text-white">
                <LayoutDashboard className="w-5 h-5" />
                <span>Overview</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <Home className="w-5 h-5" />
                <span>My Courts</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <Clock className="w-5 h-5" />
                <span>Schedule</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                <DollarSign className="w-5 h-5" />
                <span>Earnings</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
