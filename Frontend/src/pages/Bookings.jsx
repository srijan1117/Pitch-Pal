import { useMemo, useState } from "react";
import { Calendar, MapPin, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import bookingsData from "../data/bookings.json";
import { FutsalCard } from "../components/FutsalCard";
import futsalsData from "../data/futsals.json";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const configs = {
    upcoming: {
      label: "Upcoming",
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

  const config = configs[status] || configs.upcoming;

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
        You don&apos;t have any {type === "upcoming" ? "scheduled matches" : "booking history"} at the moment.
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

function BookingList({ bookings, type }) {
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
            <div className="w-full lg:w-72 shrink-0 relative overflow-hidden">
              <img
                src={booking.court?.image}
                alt={booking.court?.name}
                className="w-full h-56 lg:h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
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
                      {booking.court?.name}
                    </h3>
                    <div className="mt-2 flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1.5 text-green-600" />
                      <span className="text-sm font-medium">{booking.court?.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center pt-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">{booking.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-sm text-gray-500">
                      Booking ID: <span className="font-mono font-medium text-gray-900">#BK-{booking.id}</span>
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      Rs {booking.court?.price}
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="w-full md:w-52 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                  <Link
                    to={`/bookings/${booking.id}`}
                    className="h-[52px] flex items-center justify-center px-6 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-md hover:shadow-lg"
                  >
                    View Details
                  </Link>

                  {type === "history" && booking.status === "completed" ? (
                    <button className="h-[52px] px-6 rounded-xl bg-green-50 text-green-700 text-sm font-bold hover:bg-green-100 transition-all border border-green-100 active:scale-95">
                      Leave Review
                    </button>
                  ) : (
                    /* This invisible spacer keeps the layout identical when the review button is missing */
                    <div className="hidden md:block h-[52px]" aria-hidden="true" />
                  )}

                  {booking.status === "upcoming" && (
                    <button className="h-[52px] px-6 rounded-xl border border-red-100 bg-white text-red-600 text-sm font-bold hover:bg-red-50 transition-all active:scale-95">
                      Cancel Booking
                    </button>
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

  const enrichedBookings = useMemo(() => {
    return bookingsData.map(booking => ({
      ...booking,
      court: futsalsData.find(f => f.id === booking.futsalId)
    }));
  }, []);

  const upcoming = useMemo(() => enrichedBookings.filter((b) => b.status === "upcoming"), [enrichedBookings]);
  const history = useMemo(() => enrichedBookings.filter((b) => b.status !== "upcoming"), [enrichedBookings]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <main className="flex-grow w-full">
        {/* Header Section */}
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
          {/* Tabs Control */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
            <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex shadow-inner">
              <button
                onClick={() => setTab("upcoming")}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${tab === "upcoming"
                  ? "bg-white text-gray-900 shadow-md transform scale-105"
                  : "text-gray-500 hover:text-gray-800"
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
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${tab === "history"
                  ? "bg-white text-gray-900 shadow-md transform scale-105"
                  : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                History
              </button>
            </div>
          </div>

          <div className="min-h-[400px]">
            {tab === "upcoming" ? (
              <BookingList bookings={upcoming} type="upcoming" />
            ) : (
              <BookingList bookings={history} type="history" />
            )}
          </div>

          {/* Recommended Section */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {futsalsData.slice(0, 3).map((court) => (
                <FutsalCard key={court.id} court={court} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
