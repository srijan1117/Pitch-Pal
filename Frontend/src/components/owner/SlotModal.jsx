import { useState } from "react";
import Modal from "./Modal";
import api from "../../api/axios";

export default function SlotModal({ court, onClose, onSuccess }) {
  const [form, setForm] = useState({
    start_time: "", end_time: "", price: "", is_available: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.start_time || !form.end_time) {
      setError("Start time and end time are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post(`/futsal/courts/${court.id}/slots/create/`, {
        start_time: form.start_time,
        end_time: form.end_time,
        price: form.price || null,
        is_available: form.is_available,
      });
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      setError(typeof msg === "string" ? msg : JSON.stringify(msg) || "Failed to add slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Add Time Slot — ${court.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Start Time *</label>
            <input
              type="time"
              value={form.start_time}
              onChange={e => setForm({ ...form, start_time: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">End Time *</label>
            <input
              type="time"
              value={form.end_time}
              onChange={e => setForm({ ...form, end_time: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Price (Rs) <span className="text-gray-400 font-normal">— optional, overrides court price</span>
          </label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            placeholder="Leave empty to use court price"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="slot_available"
            checked={form.is_available}
            onChange={e => setForm({ ...form, is_available: e.target.checked })}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="slot_available" className="text-sm text-gray-700">Available for booking</label>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            {loading ? "Adding..." : "Add Slot"}
          </button>
        </div>
      </div>
    </Modal>
  );
}