import { useParams, useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { FeaturedFutsals } from "../components/FeaturedFutsals";
import { Star, MapPin, Clock, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { isLoggedIn } from "../api/auth";

export default function FutsalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [court, setCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Generate next 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDate = (date) => date.toISOString().split("T")[0];

  // ── Fetch court details ───────────────────────────────────────────────
  useEffect(() => {
    const fetchCourt = async () => {
      setLoading(true);
      try {
        const res = await api.get("/futsal/courts/");
        const data = res.data?.Result || [];
        const found = data.find(c => c.id === parseInt(id));
        if (!found) setError("Court not found.");
        else setCourt(found);
      } catch {
        setError("Failed to load court details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourt();
  }, [id]);

  // ── Fetch available slots when date changes ───────────────────────────
  useEffect(() => {
    if (!id) return;
    api.get(`/futsal/courts/${id}/slots/`, {
      params: { date: formatDate(selectedDate) }
    })
      .then(res => { setSlots(res.data?.Result || []); setSelectedSlot(""); })
      .catch(() => setSlots([]));
  }, [id, selectedDate]);

  // ── Fetch reviews ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    api.get(`/futsal/courts/${id}/reviews/`)
      .then(res => setReviews(res.data?.Result?.reviews || []))
      .catch(() => setReviews([]));
  }, [id]);

  // ── Handle booking ────────────────────────────────────────────────────
  const handleBooking = async () => {
    if (!isLoggedIn()) { navigate("/login"); return; }
    if (!selectedSlot) { setBookingError("Please select a time slot."); return; }

    setBooking(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      if (repeatWeekly) {
        // Create weekly booking
        await api.post("/futsal/bookings/weekly/create/", {
          court: parseInt(id),
          time_slot: parseInt(selectedSlot),
          start_date: formatDate(selectedDate),
        });
        setBookingSuccess("Weekly booking confirmed! This slot will repeat every week.");
      } else {
        // Create single booking
        await api.post("/futsal/bookings/create/", {
          court: parseInt(id),
          time_slot: parseInt(selectedSlot),
          booking_date: formatDate(selectedDate),
        });
        setBookingSuccess("Booking confirmed! Check your bookings page.");
      }

      setSelectedSlot("");
      setRepeatWeekly(false);

      // Refresh slots
      const res = await api.get(`/futsal/courts/${id}/slots/`, {
        params: { date: formatDate(selectedDate) }
      });
      setSlots(res.data?.Result || []);
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      setBookingError(
        typeof msg === "string" ? msg :
        JSON.stringify(msg) || "Booking failed. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-700">{error || "Court not found"}</h1>
      </div>
    );
  }

  const rating = Math.round(court.average_rating || 0);
  const galleryImages = court.gallery?.map(g => g.image) || [];
  const allImages = court.image ? [court.image, ...galleryImages] : galleryImages;

  // Find selected slot object for price display
  const selectedSlotObj = slots.find(s => s.id.toString() === selectedSlot);
  const slotPrice = selectedSlotObj?.price || court.price_per_hour;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* BACK BUTTON MOBILE */}
      <div className="block md:hidden p-4">
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          ← Back
        </button>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* IMAGE GALLERY */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <div className="md:col-span-3">
              <ImageWithFallback
                src={allImages[0]}
                alt={court.name}
                className="w-full h-64 md:h-[420px] object-cover rounded-xl shadow"
              />
            </div>
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {allImages.slice(1, 4).map((img, idx) => (
                <ImageWithFallback
                  key={idx}
                  src={img}
                  className="h-24 md:h-28 w-24 md:w-full rounded-lg object-cover flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* COURT INFO */}
          <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{court.name}</h1>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {court.average_rating ? `${court.average_rating} (${court.total_reviews} reviews)` : "No reviews yet"}
                </span>
              </div>

              <div className="flex items-center gap-1 mt-2 text-gray-500">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm">{court.address}</span>
              </div>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                Rs {slotPrice || court.price_per_hour}
                <span className="text-base text-gray-500 font-medium"> /Hour</span>
              </p>
              <button
                onClick={handleBooking}
                disabled={booking || !selectedSlot}
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {booking ? "Booking..." : "Book now"}
              </button>
            </div>
          </div>

          {/* DESCRIPTION */}
          {court.description && (
            <p className="text-gray-600 max-w-3xl mb-10">{court.description}</p>
          )}

          {/* AMENITIES */}
          {court.amenities?.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-3">Facilities & Features</h2>
              <div className="flex flex-wrap gap-3">
                {court.amenities.map((a) => (
                  <span key={a} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* BOOKING SECTION */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-10">
            <h2 className="text-xl font-semibold mb-6">Book This Court</h2>

            {/* DATE SELECTOR */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-700">Choose Date</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {days.map((day) => (
                  <button
                    key={day.toDateString()}
                    onClick={() => setSelectedDate(day)}
                    className={`min-w-[90px] rounded-xl border p-3 text-center transition ${
                      selectedDate.toDateString() === day.toDateString()
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div className="text-sm">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className="font-semibold">{day.toLocaleDateString("en-US", { day: "numeric", month: "short" })}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* TIME SLOT SELECTOR */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-700">Select Time</h3>
              </div>

              {slots.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                  No available slots for this date.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id.toString())}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        selectedSlot === slot.id.toString()
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white border-gray-200 hover:border-green-500 text-gray-700"
                      }`}
                    >
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      {slot.price && <span className="ml-2 text-xs opacity-80">Rs {slot.price}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* WEEKLY BOOKING */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="text-base font-semibold mb-1">Book Throughout the Week</h3>
              <p className="text-gray-500 text-sm mb-3">Reserve the same slot every week.</p>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="repeatWeekly"
                  checked={repeatWeekly}
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="w-5 h-5 accent-green-600"
                />
                <label htmlFor="repeatWeekly" className="text-gray-700 cursor-pointer">
                  Repeat this booking every week
                </label>
              </div>
              {repeatWeekly && (
                <p className="text-xs text-gray-500 mt-2">
                  Example: If you select Monday 7AM, it will repeat every Monday.
                </p>
              )}
            </div>

            {/* BOOKING FEEDBACK */}
            {bookingSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{bookingSuccess}</div>
            )}
            {bookingError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{bookingError}</div>
            )}

            {/* CONFIRM BUTTON */}
            <button
              onClick={handleBooking}
              disabled={booking || !selectedSlot}
              className="w-full md:w-auto px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {booking ? "Booking..." : repeatWeekly ? "Confirm Weekly Booking" : "Confirm Booking"}
            </button>
          </div>

          {/* REVIEWS SECTION */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet for this court.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{review.user_email}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                    <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FEATURED COURTS */}
          <div className="mt-16">
            <FeaturedFutsals excludeId={parseInt(id)} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}