import { useState, useEffect } from "react";
import Modal from "./Modal";
import api from "../../api/axios";

export default function WalkInModal({ courts, onClose, onSuccess }) {
  const [form, setForm] = useState({
    court: "",
    time_slot: "",
    booking_date: "",
    customer_name: "",
    customer_phone: "",
  });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch available slots when court and date change
  // When the owner picks a court and a date, we immediately call the backend
  // to get the list of available time slots for that specific day.
  useEffect(() => {
    if (!form.court || !form.booking_date) return;
    setSlots([]);
    setForm(prev => ({ ...prev, time_slot: "" }));
    api.get(`/futsal/courts/${form.court}/slots/`, {
      params: { date: form.booking_date }
    })
      .then(res => setSlots(res.data?.Result || []))
      .catch(() => setSlots([]));
  }, [form.court, form.booking_date]);

  const [submitted, setSubmitted] = useState(false);

  // This function sends the walk-in customer's details to the backend.
  // It creates a "Walk-in" booking which is automatically 'Confirmed' since 
  // the customer is already at the futsal court.
  const handleSubmit = async () => {
    setSubmitted(true);
    if (!form.court || !form.time_slot || !form.booking_date) {
      setError("Please select a court, date, and time slot first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/futsal/bookings/walkin/", {
        court: parseInt(form.court),
        time_slot: parseInt(form.time_slot),
        booking_date: form.booking_date,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
      });
      const data = res.data?.Result;
      const timeStr = data.time_slot_detail ? `${data.time_slot_detail.start_time.slice(0, 5)} - ${data.time_slot_detail.end_time.slice(0, 5)}` : "";
      setSuccess(`✅ Booking confirmed! ${data.court_name} — ${timeStr} on ${data.booking_date}. Amount: Rs ${data.total_amount}`);
      setForm({ court: "", time_slot: "", booking_date: "", customer_name: "", customer_phone: "" });
      setSlots([]);
      setSubmitted(false); // Reset on success
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      setError(typeof msg === "string" ? msg : JSON.stringify(msg) || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  const isFieldMissing = (key) => submitted && !form[key];

  // Get today's date for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal title="Walk-in Booking" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Create an instant booking for a walk-in customer.</p>

        {/* Court */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
            <span>Court *</span>
            {isFieldMissing('court') && <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Required</span>}
          </label>
          <select
            value={form.court}
            onChange={e => setForm({ ...form, court: e.target.value, time_slot: "" })}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white transition-colors ${
              isFieldMissing('court') ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          >
            <option value="">Select court</option>
            {courts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
            <span>Booking Date *</span>
            {isFieldMissing('booking_date') && <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Required</span>}
          </label>
          <input
            type="date"
            min={today}
            value={form.booking_date}
            onChange={e => setForm({ ...form, booking_date: e.target.value, time_slot: "" })}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
              isFieldMissing('booking_date') ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
        </div>

        {/* Time Slot */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
            <span>Time Slot *</span>
            {isFieldMissing('time_slot') && <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Required</span>}
          </label>
          {!form.court || !form.booking_date ? (
            <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">Select a court and date first.</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">No available slots for this date.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => {
                const isUnavailable = !slot.is_available || slot.is_booked;
                return (
                  <button
                    key={slot.id}
                    onClick={() => !isUnavailable && setForm({ ...form, time_slot: slot.id.toString() })}
                    disabled={isUnavailable}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                      isUnavailable
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                        : form.time_slot === slot.id.toString()
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white border-gray-200 hover:border-green-500 text-gray-700"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                      {isUnavailable && (
                        <span className="text-[9px] uppercase font-bold text-gray-400">
                          {slot.is_booked ? "Booked" : "Disabled"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Info (optional) */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Customer Info (Optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Customer Name</label>
              <input
                value={form.customer_name}
                onChange={e => setForm({ ...form, customer_name: e.target.value })}
                placeholder="Walk-in customer"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              <input
                value={form.customer_phone}
                onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                placeholder="98XXXXXXXX"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg font-medium">{success}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            {loading ? "Confirming..." : "Confirm Walk-in"}
          </button>
        </div>
      </div>
    </Modal>
  );
}