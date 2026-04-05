import { useState } from "react";
import Modal from "./Modal";
import api from "../../api/axios";

export default function CourtModal({ court = null, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: court?.name || "",
    address: court?.address || "",
    description: court?.description || "",
    price_per_hour: court?.price_per_hour || "",
    is_active: court?.is_active ?? true,
    amenities: Array.isArray(court?.amenities) ? court.amenities.join(", ") : "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("address", form.address);
      formData.append("description", form.description);
      formData.append("price_per_hour", form.price_per_hour);
      formData.append("is_active", form.is_active);
      const amenitiesArray = form.amenities
        ? form.amenities.split(",").map(a => a.trim()).filter(Boolean)
        : [];
      formData.append("amenities", JSON.stringify(amenitiesArray));
      if (image) formData.append("image", image);

      if (court) {
        await api.put(`/futsal/courts/${court.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/futsal/courts/create/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      setError(typeof msg === "string" ? msg : JSON.stringify(msg) || "Failed to save court.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={court ? "Edit Court" : "Add New Court"} onClose={onClose}>
      <div className="space-y-4">
        {[
          { key: "name", label: "Court Name *" },
          { key: "address", label: "Address *" },
          { key: "price_per_hour", label: "Price Per Hour (Rs) *", type: "number" },
        ].map(({ key, label, type }) => (
          <div key={key}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
            <input
              type={type || "text"}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        ))}

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Amenities <span className="text-gray-400 font-normal">(comma separated)</span>
          </label>
          <input
            value={form.amenities}
            onChange={e => setForm({ ...form, amenities: e.target.value })}
            placeholder="Parking, Shower, Canteen"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Court Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold hover:file:bg-green-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={e => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible to users)</label>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            {loading ? "Saving..." : court ? "Update Court" : "Add Court"}
          </button>
        </div>
      </div>
    </Modal>
  );
}