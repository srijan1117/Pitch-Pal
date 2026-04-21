import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { LogOut, Home, Calendar, LayoutDashboard, Menu, X, Loader2, Trophy } from "lucide-react";
import { clearSession } from "../../api/auth";
import api from "../../api/axios";
import LogoutConfirmationModal from "../../components/LogoutConfirmationModal";
import logo from "../../assets/logo.png";
import OwnerOverview from "./OwnerOverview";
import OwnerCourts from "./OwnerCourts";
import OwnerBookings from "./OwnerBookings";
import OwnerTournaments from "./OwnerTournaments";

const NAV_ITEMS = [
  { id: "overview",    label: "Overview",    icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "courts",      label: "My Courts",   icon: <Home className="w-5 h-5" /> },
  { id: "bookings",    label: "Bookings",    icon: <Calendar className="w-5 h-5" /> },
  { id: "tournaments", label: "Tournaments", icon: <Trophy className="w-5 h-5" /> },
];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [courtsRes, bookingsRes, tournamentsRes] = await Promise.all([
        api.get("/futsal/courts/mine/"),
        api.get("/futsal/bookings/owner/"),
        api.get("/futsal/tournaments/mine/"),
      ]);
      setCourts(courtsRes.data?.Result || []);
      setBookings(bookingsRes.data?.Result || []);
      setTournaments(tournamentsRes.data?.Result || []);
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => { clearSession(); navigate("/login"); };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">


      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col shrink-0">

        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm">
            <img src={logo} alt="PitchPal Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">PitchPal</span>
        </div>


        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-sm font-medium ${
                activeTab === item.id
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>


        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-red-400 transition text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>


      <div className="flex-1 flex flex-col overflow-hidden">


        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">{currentLabel}</h1>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="md:hidden flex items-center gap-2 text-gray-500 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>


        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {activeTab === "overview" && (
            <OwnerOverview courts={courts} bookings={bookings} onTabChange={handleTabChange} onRefresh={fetchData}/>
          )}
          {activeTab === "courts" && (
            <OwnerCourts courts={courts} onRefresh={fetchData} />
          )}
          {activeTab === "bookings" && (
            <OwnerBookings bookings={bookings} courts={courts} onRefresh={fetchData} />
          )}
          {activeTab === "tournaments" && (
            <OwnerTournaments tournaments={tournaments} onRefresh={fetchData} />
          )}
        </main>
      </div>


      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-gray-900 text-white flex flex-col h-full shadow-2xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                  <img src={logo} alt="PitchPal Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">PitchPal</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-lg transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left text-sm font-medium ${
                    activeTab === item.id
                      ? "bg-green-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <button onClick={() => { setIsLogoutModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-red-400 transition text-sm">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}