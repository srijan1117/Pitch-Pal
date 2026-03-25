import { useNavigate } from "react-router-dom";
import { LogOut, Home, Calendar, LayoutDashboard, Clock, DollarSign } from "lucide-react";
import { logout } from "../api/auth";

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = [
    { title: "Total Courts", value: "3", icon: <Home className="w-5 h-5" /> },
    { title: "Today's Bookings", value: "8", icon: <Calendar className="w-5 h-5" /> },
    { title: "Pending Requests", value: "2", icon: <Clock className="w-5 h-5" /> },
    { title: "Monthly Revenue", value: "Rs. 45,000", icon: <DollarSign className="w-5 h-5" /> },
  ];

  const recentBookings = [
    { id: 1, court: "Court A", player: "John Doe", date: "2023-11-01", time: "18:00 - 19:00", status: "Confirmed" },
    { id: 2, court: "Court B", player: "Jane Smith", date: "2023-11-01", time: "19:00 - 20:00", status: "Pending" },
    { id: 3, court: "Court A", player: "Mike Johnson", date: "2023-11-02", time: "17:00 - 18:00", status: "Confirmed" },
    { id: 4, court: "Court C", player: "Emily Davis", date: "2023-11-02", time: "18:00 - 19:00", status: "Cancelled" },
    { id: 5, court: "Court B", player: "Chris Wilson", date: "2023-11-03", time: "20:00 - 21:00", status: "Confirmed" },
  ];

  const myCourts = [
    { id: 1, name: "Court A (Standard)", price: "Rs. 1,000 / hr", active: true },
    { id: 2, name: "Court B (Premium)", price: "Rs. 1,500 / hr", active: true },
    { id: 3, name: "Court C (Indoor)", price: "Rs. 1,200 / hr", active: false },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Owner Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
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
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
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
                    {recentBookings.map((bk) => (
                      <tr key={bk.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-800 font-medium">{bk.court}</td>
                        <td className="px-6 py-4 text-gray-600">{bk.player}</td>
                        <td className="px-6 py-4 text-gray-600">{bk.date}</td>
                        <td className="px-6 py-4 text-gray-600">{bk.time}</td>
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
                {myCourts.map((court) => (
                  <div key={court.id} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{court.name}</h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                        court.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                      }`}>
                        {court.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{court.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
