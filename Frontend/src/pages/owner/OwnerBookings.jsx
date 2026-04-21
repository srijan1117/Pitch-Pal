import { useState } from "react";
import { Search, Plus } from "lucide-react";
import StatusBadge from "../../components/owner/StatusBadge";
import WalkInModal from "../../components/owner/WalkInModal";

export default function OwnerBookings({ bookings, courts, onRefresh }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWalkIn, setShowWalkIn] = useState(false);

  // We use this 'filtered' list to show only the bookings that match what the owner
  // is searching for (player email or court name) and the status they select.
  const filtered = bookings.filter(b => {
    const matchSearch =
      b.court_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">


      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
        <button
          onClick={() => setShowWalkIn(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Walk-in Booking
        </button>
      </div>


      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by court or player..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>


      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Court</th>
                <th className="px-5 py-3">Player</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.map(bk => (
                <tr key={bk.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">#{bk.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{bk.court_name}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {bk.user_email || `Walk-in: ${bk.customer_name || 'Anonymous'}`}
                  </td>
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
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {search || statusFilter !== "all" ? "No bookings match your filters." : "No bookings yet."}
            </div>
          )}
        </div>
      </div>

      {bookings.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {filtered.length} of {bookings.length} bookings
        </div>
      )}


      {showWalkIn && (
        <WalkInModal
          courts={courts}
          onClose={() => setShowWalkIn(false)}
          onSuccess={() => { setShowWalkIn(false); onRefresh(); }}
        />
      )}
    </div>
  );
}