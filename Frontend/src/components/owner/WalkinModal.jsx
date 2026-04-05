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

  const handleSubmit = async () => {
    if (!form.court || !form.time_slot || !form.booking_date) {
      setError("Court, time slot and date are required.");
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
      setSuccess(`✅ Booking confirmed! ${data.court} — ${data.time_slot} on ${data.booking_date}. Amount: Rs ${data.total_amount}`);
      setForm({ court: "", time_slot: "", booking_date: "", customer_name: "", customer_phone: "" });
      setSlots([]);
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      setError(typeof msg === "string" ? msg : JSON.stringify(msg) || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal title="Walk-in Booking" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Create an instant booking for a walk-in customer.</p>

        {/* Court */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Court *</label>
          <select
            value={form.court}
            onChange={e => setForm({ ...form, court: e.target.value, time_slot: "" })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
          >
            <option value="">Select court</option>
            {courts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Booking Date *</label>
          <input
            type="date"
            min={today}
            value={form.booking_date}
            onChange={e => setForm({ ...form, booking_date: e.target.value, time_slot: "" })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Time Slot */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Time Slot *</label>
          {!form.court || !form.booking_date ? (
            <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">Select a court and date first.</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">No available slots for this date.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setForm({ ...form, time_slot: slot.id.toString() })}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                    form.time_slot === slot.id.toString()
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white border-gray-200 hover:border-green-500 text-gray-700"
                  }`}
                >
                  {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  {slot.price && <span className="ml-1 text-xs opacity-80">Rs {slot.price}</span>}
                </button>
              ))}
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