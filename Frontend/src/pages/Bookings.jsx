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
  if (status === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
        <AlertCircle className="h-3.5 w-3.5" />
        Upcoming
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-100">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Played
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 border border-red-100">
        <XCircle className="h-3.5 w-3.5" />
        Cancelled
      </span>
    );
  }
  return null;
}

function EmptyState({ type }) {
  return (
    <div className="bg-white/70 border border-gray-200 rounded-2xl shadow-sm">
      <div className="p-6 sm:p-8">
        <div className="text-center py-10">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
          <p className="text-gray-500 mt-1 mb-6">
            You don&apos;t have any {type === "upcoming" ? "upcoming" : "past"} bookings.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Browse Courts
          </Link>
        </div>
      </div>
    </div>
  );
}

function BookingList({ bookings, type }) {
  if (!bookings.length) return <EmptyState type={type} />;

  return (
    <div className="bg-white/70 border border-gray-200 rounded-2xl shadow-sm">
      <div className="space-y-5">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row gap-5 p-5 sm:p-6 md:p-7">
              {/* Image */}
              <div className="w-full md:w-60 shrink-0">
                <div className="h-48 sm:h-56 md:h-full">
                  <img
                    src={booking.image}
                    alt={booking.courtName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Middle */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-semibold text-gray-900 leading-tight">
                      {booking.courtName}
                    </h3>

                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="mt-3 flex items-center text-base text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    {booking.location}
                  </div>

                  {(booking.rating || booking.reviews) && (
                    <div className="mt-3 text-base text-gray-600">
                      <span className="text-yellow-500 text-lg">★★★★★</span>{" "}
                      <span className="text-gray-500">
                        {booking.reviews ?? ""} {booking.reviews ? "reviews" : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 text-lg">
                  <span className="text-gray-500">Price:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    Rs {booking.price}
                  </span>
                </div>
              </div>

              {/* Right */}
              {/* Right */}
<div className="md:w-64 w-full flex flex-col gap-4 md:items-end">
  {/* Info panel */}
  <div className="w-full md:w-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-xs font-medium text-gray-500">Date</p>
        <p className="font-semibold text-gray-900">{booking.date}</p>
      </div>
      <div className="text-right md:text-left">
        <p className="text-xs font-medium text-gray-500">Time</p>
        <p className="font-semibold text-gray-900">{booking.time}</p>
      </div>

      <div className="col-span-2">
        <p className="text-xs font-medium text-gray-500">Booking ID</p>
        <p className="font-semibold text-gray-900">{booking.id}</p>
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className="w-full md:w-auto flex flex-col gap-3">
    <Link
      to={`/bookings/${booking.id}`}
      className="w-full md:w-auto px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors text-center"
    >
      View Details
    </Link>

    {/* Review for history */}
    {type === "history" && (
      <button className="w-full md:w-auto px-5 py-3 rounded-xl bg-yellow-100 text-yellow-900 text-sm font-semibold hover:bg-yellow-200 transition-colors">
        Review
      </button>
    )}

    {/* Cancel for upcoming */}
    {booking.status === "upcoming" && (
      <button className="w-full md:w-auto px-5 py-3 rounded-xl border border-red-200 bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
        Cancel Booking
      </button>
    )}
  </div>
</div>

            </div>
          </div>

        ))}
      </div>
    </div>
  );
}

export default function Bookings() {
  const [bookings] = useState(bookingsData);
  const [tab, setTab] = useState("upcoming");

  const upcoming = useMemo(() => bookings.filter((b) => b.status === "upcoming"), [bookings]);
  const history = useMemo(() => bookings.filter((b) => b.status !== "upcoming"), [bookings]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex">
              <button
                onClick={() => setTab("upcoming")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "upcoming" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTab("history")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "history" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                History
              </button>
            </div>
          </div>

          {tab === "upcoming" ? (
            <BookingList bookings={upcoming} type="upcoming" />
          ) : (
            <BookingList bookings={history} type="history" />
          )}

          {/* Book Now */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Book Now</h2>
              <Link
                to="/browse"
                className="text-sm font-semibold text-green-600 hover:text-green-700"
              >
                Browse all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {futsalsData.slice(0, 3).map((court) => (
                <FutsalCard key={court.id || court.name} court={court} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
