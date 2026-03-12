import { useParams, useNavigate } from "react-router-dom";
import futsalsData from "../data/futsals.json";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { FeaturedFutsals } from "../components/FeaturedFutsals";
import { Star } from "lucide-react";
import { useState } from "react";

export default function FutsalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const futsal = futsalsData.find((f) => f.id === parseInt(id));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");

  // Generate next 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // Generate time slots
  const generateSlots = () => {
    if (!futsal?.timeSlotPrices) return [];
    return futsal.timeSlotPrices.map((slot) => ({
      time: slot.startTime,
      price: slot.price,
      available: true,
    }));
  };

  const slots = generateSlots();

  if (!futsal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-700">Futsal not found</h1>
      </div>
    );
  }

  const rating = Math.round(futsal.rating || 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* BACK BUTTON MOBILE */}
      <div className="block md:hidden p-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>

      <main className="flex-1">

        {/* MAIN CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* IMAGE GALLERY */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">

            {/* MAIN IMAGE */}
            <div className="md:col-span-3">
              <ImageWithFallback
                src={futsal.images?.[0] || futsal.image}
                alt={futsal.name}
                className="w-full h-64 md:h-[420px] object-cover rounded-xl shadow"
              />
            </div>

            {/* SMALL IMAGES */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {(futsal.images?.slice(1, 4) || []).map((img, idx) => (
                <ImageWithFallback
                  key={idx}
                  src={img}
                  className="h-24 md:h-28 w-24 md:w-full rounded-lg object-cover flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* FUTSAL INFO */}
          <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {futsal.name}
              </h1>

              {/* RATING */}
              <div className="flex mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* PRICE */}
            <div className="text-left lg:text-right">
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                Rs {futsal.price}
                <span className="text-base text-gray-500 font-medium">
                  {" "}
                  /Hour
                </span>
              </p>

              <button className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Book now
              </button>
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="text-gray-600 max-w-3xl mb-10">
            {futsal.description}
          </p>

          {/* AMENITIES */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-3">
              Facilities & Features
            </h2>

            <div className="flex flex-wrap gap-3">
              {futsal.amenities?.map((a) => (
                <span
                  key={a}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* DATE SELECTOR */}
          {futsal.weeklyBookingEnabled && (
            <div className="mb-10">

              <h2 className="text-xl font-semibold mb-4">
                Choose Date
              </h2>

              <div className="flex gap-3 overflow-x-auto pb-2">

                {days.map((day) => (
                  <button
                    key={day.toDateString()}
                    onClick={() => setSelectedDate(day)}
                    className={`min-w-[90px] rounded-xl border p-3 text-center transition ${
                      selectedDate.toDateString() === day.toDateString()
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-sm">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>

                    <div className="font-semibold">
                      {day.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </button>
                ))}

              </div>
            </div>
          )}

          {/* TIME SELECTOR */}
          <div className="mb-10">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>

            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Choose a time</option>

              {slots.map((slot, idx) => (
                <option key={idx} value={slot.time}>
                  {slot.time} - Rs {slot.price}
                </option>
              ))}
            </select>

          </div>

          {/* WEEKLY BOOKING */}
          {futsal.weeklyBookingEnabled && (
            <div className="mb-10 p-4 bg-white border rounded-xl">

              <h2 className="text-lg font-semibold mb-2">
                Book Throughout the Week
              </h2>

              <p className="text-gray-600 text-sm mb-3">
                Reserve the same slot every week.
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-green-600"
                />

                <label className="text-gray-700">
                  Repeat this booking every week
                </label>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Example: Monday 7PM will repeat every Monday.
              </p>

            </div>
          )}

          {/* CONFIRM BUTTON */}
          <button className="w-full md:w-auto px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition">
            Confirm Booking
          </button>

          {/* FEATURED FUTSAL */}
          <div className="mt-16">
            <FeaturedFutsals excludeId={futsal.id} />
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}