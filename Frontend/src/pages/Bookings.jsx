import { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { FeaturedFutsals } from "../components/FeaturedFutsals";
import api from "../api/axios";

function StatusBadge({ status }) {
  const configs = {
    pending: {
      label: "Pending",
      classes: "bg-yellow-50 text-yellow-700 border-yellow-100",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    confirmed: {
      label: "Confirmed",
      classes: "bg-blue-50 text-blue-700 border-blue-100",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
    completed: {
      label: "Played",
      classes: "bg-green-50 text-green-700 border-green-100",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    cancelled: {
      label: "Cancelled",
      classes: "bg-red-50 text-red-700 border-red-100",
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
  };

  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${config.classes}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function EmptyState({ type }) {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center">
      <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3">
        <Calendar className="w-10 h-10 text-gray-400 -rotate-3" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">No {type} bookings</h3>
      <p className="text-gray-500 mt-2 mb-8 max-w-xs mx-auto">
        You don't have any {type === "upcoming" ? "scheduled matches" : "booking history"} at the moment.
      </p>
      <Link
        to="/browse"
        className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-white bg-green-600 hover:bg-green-700 transition-all font-bold shadow-lg shadow-green-100 active:scale-95"
      >
        Find a Court
      </Link>
    </div>
  );
}

function BookingList({ bookings, type, onCancel }) {
  if (!bookings.length) return <EmptyState type={type} />;

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
        >
          <div className="flex flex-col lg:flex-row gap-0">
            {/* Image Section */}
            <div className="w-full lg:w-72 shrink-0 relative overflow-hidden bg-gray-100">
              {booking.court_image ? (
                <img
                  src={booking.court_image}
                  alt={booking.court_name}
                  className="w-full h-56 lg:h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-56 lg:h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-2xl">{booking.court_name?.charAt(0)}</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <StatusBadge status={booking.status} />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row justify-between gap-6 h-full">
                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                      {booking.court_name}
                    </h3>
                    <div className="mt-2 flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1.5 text-green-600" />
                      <span className="text-sm font-medium">{booking.court_address}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center pt-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">{booking.booking_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        {booking.time_slot_detail?.start_time?.slice(0, 5)} - {booking.time_slot_detail?.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-sm text-gray-500">
                      Booking ID: <span className="font-mono font-medium text-gray-900">#BK-{booking.id}</span>
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      Rs {booking.total_amount}
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="w-full md:w-52 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                  {type === "history" && booking.status === "completed" && (
                    <Link
                      to={`/browse/${booking.court}`}
                      className="h-[52px] flex items-center justify-center px-6 rounded-xl bg-green-50 text-green-700 text-sm font-bold hover:bg-green-100 transition-all border border-green-100 active:scale-95"
                    >
                      Leave Review
                    </Link>
                  )}

                  {(booking.status === "pending" || booking.status === "confirmed") && (
                    <button
                      onClick={() => onCancel(booking.id)}
                      className="h-[52px] px-6 rounded-xl border border-red-100 bg-white text-red-600 text-sm font-bold hover:bg-red-50 transition-all active:scale-95"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status === "pending" && (
                    <Link
                      to={`/browse/${booking.court}`}
                      className="h-[52px] flex items-center justify-center px-6 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-md"
                    >
                      Pay Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Bookings() {
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, courtsRes] = await Promise.all([
        api.get("/futsal/bookings/"),
        api.get("/futsal/courts/")
      ]);

      const bookingsData = bookingsRes.data?.Result || [];
      const courtsData = courtsRes.data?.Result || [];

      // Enrich bookings with court image and address
      const enriched = bookingsData.map(booking => {
        const court = courtsData.find(c => c.id === booking.court);
        return {
          ...booking,
          court_name: booking.court_name,
          court_image: court?.image || null,
          court_address: court?.address || "",
        };
      });

      setBookings(enriched);
      setCourts(courtsData);
    } catch (err) {
      if (err?.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      await api.patch(`/futsal/bookings/${bookingId}/cancel/`);
      fetchBookings();
    } catch (err) {
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = bookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const history = bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <main className="flex-grow w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              My <span className="text-green-600">Bookings</span>
            </h1>
            <p className="mt-3 text-lg text-gray-500 max-w-2xl">
              Manage your upcoming games and view your past futsal history.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
            <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex shadow-inner">
              <button
                onClick={() => setTab("upcoming")}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  tab === "upcoming" ? "bg-white text-gray-900 shadow-md transform scale-105" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Upcoming
                {upcoming.length > 0 && (
                  <span className="ml-2 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {upcoming.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab("history")}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  tab === "history" ? "bg-white text-gray-900 shadow-md transform scale-105" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                History
                {history.length > 0 && (
                  <span className="ml-2 bg-gray-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {history.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="min-h-[400px]">
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="flex flex-col lg:flex-row">
                      <div className="w-full lg:w-72 h-56 bg-gray-100" />
                      <div className="flex-1 p-8 space-y-4">
                        <div className="h-6 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tab === "upcoming" ? (
              <BookingList bookings={upcoming} type="upcoming" onCancel={handleCancel} />
            ) : (
              <BookingList bookings={history} type="history" onCancel={handleCancel} />
            )}
          </div>

          {/* Recommended Courts */}
          <div className="mt-24 border-t border-gray-200 pt-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Book Your Next Match</h2>
                <p className="text-gray-500 mt-2">Popular courts near you</p>
              </div>
              <Link
                to="/browse"
                className="group flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg transition-all"
              >
                Browse all
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <FeaturedFutsals limit={3} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}