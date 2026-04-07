import { useState } from "react";
import Modal from "./Modal";
import api from "../../api/axios";

export default function TournamentModal({ tournament = null, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: tournament?.title || "",
    organizer: tournament?.organizer || (localStorage.getItem("role") === "owner" ? localStorage.getItem("email") : ""),
    location: tournament?.location || "",
    date: tournament?.date || "",
    start_date: tournament?.start_date || "",
    end_date: tournament?.end_date || "",
    prize_pool: tournament?.prize_pool || "",
    entry_fee: tournament?.entry_fee || "",
    team_limit: tournament?.team_limit || "",
    format: tournament?.format || "",
    description: tournament?.description || "",
    rules: Array.isArray(tournament?.rules) ? tournament.rules.join("\n") : "",
    status: tournament?.status || "Registration Open",
    state: tournament?.state || "upcoming",
    contact_phone: tournament?.contact_phone || "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      
      // Add all text fields to FormData
      Object.entries(form).forEach(([k, v]) => {
        formData.append(k, v);
      });
      
      // Only append image if a new file was selected (not null or a placeholder)
      if (image && image instanceof File) {
        formData.append("image", image);
      }

      if (tournament) {
        await api.put(`/futsal/tournaments/${tournament.id}/update/`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/futsal/tournaments/create/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      setError(typeof msg === "string" ? msg : JSON.stringify(msg) || "Failed to save tournament.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "title", label: "Title *" },
    { key: "organizer", label: "Organizer *" },
    { key: "location", label: "Location *" },
    { key: "date", label: "Date Label * (e.g. Apr 15 - Apr 20, 2026)" },
    { key: "start_date", label: "Start Date *", type: "date" },
    { key: "end_date", label: "End Date *", type: "date" },
    { key: "prize_pool", label: "Prize Pool * (e.g. Rs 1,00,000)" },
    { key: "entry_fee", label: "Entry Fee * (e.g. Rs 5,000)" },
    { key: "team_limit", label: "Team Limit *", type: "number" },
    { key: "format", label: "Format * (e.g. Knockout, League)" },
    { key: "contact_phone", label: "Contact Phone" },
  ];

  return (
    <Modal title={tournament ? "Edit Tournament" : "Create Tournament"} onClose={onClose}>
      <div className="space-y-4">
        {fields.map(({ key, label, type }) => (
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
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
          <textarea value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Rules <span className="text-gray-400 font-normal">(one per line)</span>
          </label>
          <textarea value={form.rules}
            onChange={e => setForm({ ...form, rules: e.target.value })}
            rows={3}
            placeholder={"Standard FIFA rules apply.\nEach team max 8 players."}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
              <option>Registration Open</option>
              <option>Registration Closed</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
            <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="history">History</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Tournament Image {tournament && <span className="text-gray-400 font-normal">(leave empty to keep current)</span>}
          </label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold hover:file:bg-green-100" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            {loading ? "Saving..." : tournament ? "Update Tournament" : "Create Tournament"}
          </button>
        </div>
      </div>
    </Modal>
  );
}