import { Home, Calendar, Clock, DollarSign } from "lucide-react";
import StatCard from "../../components/owner/StatCard";
import StatusBadge from "../../components/owner/StatusBadge";

export default function OwnerOverview({ courts, bookings, onTabChange }) {
  const today = new Date().toISOString().split("T")[0];
  const todaysBookings = bookings.filter(b => b.booking_date === today).length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const totalRevenue = bookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courts" value={courts.length} icon={<Home className="w-5 h-5" />} color="blue" />
        <StatCard title="Today's Bookings" value={todaysBookings} icon={<Calendar className="w-5 h-5" />} color="green" />
        <StatCard title="Pending Requests" value={pendingBookings} icon={<Clock className="w-5 h-5" />} color="yellow" />
        <StatCard title="Total Revenue" value={`Rs ${totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} color="purple" />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
          <button onClick={() => onTabChange("bookings")}
            className="text-sm text-green-600 font-medium hover:underline">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3">Court</th>
                <th className="px-5 py-3">Player</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {bookings.slice(0, 8).map(bk => (
                <tr key={bk.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-800">{bk.court_name}</td>
                  <td className="px-5 py-3 text-gray-500">{bk.user_email}</td>
                  <td className="px-5 py-3 text-gray-500">{bk.booking_date}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {bk.time_slot_detail?.start_time?.slice(0, 5)} – {bk.time_slot_detail?.end_time?.slice(0, 5)}
                  </td>
                  <td className="px-5 py-3 font-semibold text-green-700">Rs {bk.total_amount}</td>
                  <td className="px-5 py-3"><StatusBadge status={bk.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="text-center py-10 text-gray-400">No bookings yet.</div>
          )}
        </div>
      </div>

      {/* My Courts Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">My Courts</h2>
          <button onClick={() => onTabChange("courts")}
            className="text-sm text-green-600 font-medium hover:underline">
            Manage courts
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courts.map(court => (
            <div key={court.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              {court.image ? (
                <img src={court.image} alt={court.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-green-700 font-bold">{court.name?.charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{court.name}</p>
                <p className="text-xs text-gray-500">Rs {court.price_per_hour}/hr</p>
              </div>
              <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${
                court.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {court.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
          {courts.length === 0 && (
            <p className="text-gray-400 text-sm col-span-3">No courts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}