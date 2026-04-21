import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { FeaturedFutsals } from "../components/FeaturedFutsals";
import { Star, MapPin, Clock, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { isLoggedIn } from "../api/auth";
import EsewaPaymentModal from "../components/EsewaPaymentModal";

export default function FutsalDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const reviewRef = useRef(null);

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
  const [payingBooking, setPayingBooking] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(null);

  // Review states
  const [completedBooking, setCompletedBooking] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  // ── Auto-scroll to review if hash present ───────────────────────────────
  useEffect(() => {
    if (location.hash === "#review" && reviewRef.current && !loading) {
      setTimeout(() => {
        reviewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, [location.hash, loading]);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDate = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

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
    api.get(`/futsal/courts/${id}/slots/`, { params: { date: formatDate(selectedDate) } })
      .then(res => { setSlots(res.data?.Result || []); setSelectedSlot(""); })
      .catch(() => setSlots([]));
  }, [id, selectedDate]);

  // ── Fetch reviews ─────────────────────────────────────────────────────
  const fetchReviews = () => {
    if (!id) return;
    api.get(`/futsal/courts/${id}/reviews/`)
      .then(res => setReviews(res.data?.Result?.reviews || []))
      .catch(() => setReviews([]));
  };

  useEffect(() => { fetchReviews(); }, [id]);

  // ── Check if user has completed booking for this court ────────────────
  useEffect(() => {
    if (!isLoggedIn() || !id) return;
    
    const checkStatus = async () => {
      try {
        const [bookingsRes, reviewsRes] = await Promise.all([
          api.get("/futsal/bookings/"),
          api.get(`/futsal/courts/${id}/reviews/`)
        ]);

        const bookings = bookingsRes.data?.Result || [];
        const courtReviews = reviewsRes.data?.Result?.reviews || [];
        const myEmail = localStorage.getItem("email");

        // Check if I have already reviewed this court
        const myReview = courtReviews.find(rv => rv.user_email === myEmail);
        if (myReview) {
          setAlreadyReviewed(true);
          return;
        }

        // Find a completed booking for this court
        const completed = bookings.find(
          b => b.court === parseInt(id) && b.status === "completed"
        );
        if (completed) {
          setCompletedBooking(completed);
        }
      } catch (err) {
        console.error("Error checking review status:", err);
      }
    };

    checkStatus();
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
        const res = await api.post("/futsal/bookings/weekly/create/", {
          court: parseInt(id),
          time_slot: parseInt(selectedSlot),
          start_date: formatDate(selectedDate),
        });
        setBookingSuccess("Weekly booking initiated. Please complete payment.");
        setPayingBooking(res.data?.Result);
      } else {
        const res = await api.post("/futsal/bookings/create/", {
          court: parseInt(id),
          time_slot: parseInt(selectedSlot),
          booking_date: formatDate(selectedDate),
        });
        setBookingSuccess("Booking initiated. Please complete payment.");
        setPayingBooking(res.data?.Result);
      }

      setSelectedSlot("");
      setRepeatWeekly(false);

      const res = await api.get(`/futsal/courts/${id}/slots/`, {
        params: { date: formatDate(selectedDate) }
      });
      setSlots(res.data?.Result || []);
    } catch (err) {
      const data = err?.response?.data;
      // Try to extract the most meaningful error message
      const msg = data?.ErrorMessage || data?.detail || data?.error || data;
      
      let errorString = "Booking failed. Please try again.";
      
      if (typeof msg === "string") {
        errorString = msg;
      } else if (typeof msg === "object" && msg !== null) {
        // Handle DRF validation errors (e.g., { "field": ["error"] } or "non_field_errors")
        const firstError = Object.values(msg)[0];
        if (Array.isArray(firstError)) {
          errorString = firstError[0];
        } else if (typeof firstError === "string") {
          errorString = firstError;
        } else {
          errorString = JSON.stringify(msg);
        }
      }
      
      setBookingError(errorString);
    } finally {
      setBooking(false);
    }
  };

  // ── Handle review submit ──────────────────────────────────────────────
  const handleReviewSubmit = async () => {
    if (!reviewRating) { setReviewError("Please select a star rating."); return; }
    if (!completedBooking) return;

    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      await api.post("/futsal/reviews/create/", {
        court: parseInt(id),
        booking: completedBooking.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess("Review submitted successfully! Thank you.");
      setAlreadyReviewed(true);
      setReviewRating(0);
      setReviewComment("");
      fetchReviews();
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      if (msg?.booking) {
        setAlreadyReviewed(true);
        setReviewSuccess("You have already reviewed this court!");
      } else {
        setReviewError(
          typeof msg === "string" ? msg :
            JSON.stringify(msg) || "Failed to submit review."
        );
      }
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
    const selectedSlotObj = slots.find(s => s.id.toString() === selectedSlot);
    const slotPrice = selectedSlotObj?.price || court.price_per_hour;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">

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
                <div 
                  className="cursor-pointer overflow-hidden rounded-xl shadow group relative"
                  onClick={() => setViewerIndex(0)}
                >
                  <ImageWithFallback
                    src={allImages[0]}
                    alt={court.name}
                    className="w-full h-64 md:h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              </div>
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
                {allImages.slice(1, 4).map((img, idx) => {
                  const actualIndex = idx + 1;
                  const isLast = idx === 2;
                  const hasMore = allImages.length > 4;

                  return (
                    <div 
                      key={idx} 
                      className="h-24 md:h-28 w-24 md:w-full rounded-lg overflow-hidden relative group cursor-pointer"
                      onClick={() => setViewerIndex(actualIndex)}
                    >
                      <ImageWithFallback
                        src={img}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {isLast && hasMore && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{allImages.length - 4}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  );
                })}
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
                    <span key={a} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">{a}</span>
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
                      className={`min-w-[90px] rounded-xl border p-3 text-center transition ${selectedDate.toDateString() === day.toDateString()
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
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">No available slots for this date.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {slots.map((slot) => {
                      const isUnavailable = !slot.is_available || slot.is_booked;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => !isUnavailable && setSelectedSlot(slot.id.toString())}
                          disabled={isUnavailable}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                            isUnavailable
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : selectedSlot === slot.id.toString()
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white border-gray-200 hover:border-green-500 text-gray-700"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                            {isUnavailable ? (
                              <span className="text-[10px] uppercase font-bold text-gray-400">
                                {slot.is_booked ? "Booked" : "Disabled"}
                              </span>
                            ) : (
                              slot.price && <span className="text-[10px] opacity-80">Rs {slot.price}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* WEEKLY BOOKING */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="text-base font-semibold mb-1">Book Throughout the Week</h3>
                <p className="text-gray-500 text-sm mb-3">Reserve the same slot every week.</p>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="repeatWeekly" checked={repeatWeekly}
                    onChange={(e) => setRepeatWeekly(e.target.checked)} className="w-5 h-5 accent-green-600" />
                  <label htmlFor="repeatWeekly" className="text-gray-700 cursor-pointer">Repeat this booking every week</label>
                </div>
                {repeatWeekly && (
                  <p className="text-xs text-gray-500 mt-2">Example: If you select Monday 7AM, it will repeat every Monday.</p>
                )}
              </div>

              {bookingSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{bookingSuccess}</div>}
              {bookingError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{bookingError}</div>}

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
              <h2 ref={reviewRef} className="text-xl font-semibold mb-4">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>

              {/* REVIEW FORM — only for users with completed bookings */}
              {isLoggedIn() && completedBooking && !alreadyReviewed && (
                <div className="bg-white rounded-xl border border-green-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Leave a Review</h3>
                  <p className="text-sm text-gray-500 mb-4">You played here! Share your experience.</p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${star <= (hoverRating || reviewRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                            }`}
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="ml-2 text-sm text-gray-600 font-medium">
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating]}
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Write your experience... (optional)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none mb-4"
                  />

                  {reviewSuccess && <div className="mb-3 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{reviewSuccess}</div>}
                  {reviewError && <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{reviewError}</div>}

                  <button
                    onClick={handleReviewSubmit}
                    disabled={submittingReview || !reviewRating}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}

              {isLoggedIn() && completedBooking && alreadyReviewed && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700 font-medium">
                  ✅ You have already reviewed this court. Thank you!
                </div>
              )}

              {/* REVIEWS LIST */}
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

        {/* eSewa Payment Modal */}
        {payingBooking && (
          <EsewaPaymentModal
            booking={!payingBooking.start_date ? payingBooking : null}
            weeklyBooking={payingBooking.start_date ? payingBooking : null}
            onClose={() => {
              setPayingBooking(null);
              setBookingSuccess(""); // Clear the message when modal is closed
            }}
          />
        )}

        {/* IMAGE LIGHTBOX */}
        {viewerIndex !== null && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            <button 
              onClick={() => setViewerIndex(null)}
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-[110]"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setViewerIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1)); }}
                className="absolute left-0 md:-left-20 text-white hover:bg-white/10 p-4 rounded-full transition-all z-[110]"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>

              <img 
                src={allImages[viewerIndex]} 
                alt="Gallery preview"
                className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-sm transition-opacity duration-300"
              />

              <button 
                onClick={(e) => { e.stopPropagation(); setViewerIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0)); }}
                className="absolute right-0 md:-right-20 text-white hover:bg-white/10 p-4 rounded-full transition-all z-[110]"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>

            <div className="mt-8 flex gap-3 overflow-x-auto max-w-full px-4 py-2 scrollbar-hide">
              {allImages.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setViewerIndex(i)}
                  className={`relative flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    viewerIndex === i ? "border-green-500 scale-110 shadow-lg shadow-green-500/20" : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                </button>
              ))}
            </div>
            
            <p className="text-gray-400 mt-6 text-sm font-semibold tracking-wider">
              {viewerIndex + 1} / {allImages.length}
            </p>
          </div>
        )}
      </div>
    );
  }