import { useState } from "react";
import Modal from "./Modal";
import api from "../../api/axios";

export default function TournamentModal({ tournament = null, onClose, onSuccess }) {
  // Helper to ensure dates are in YYYY-MM-DD format for HTML date inputs
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  const [form, setForm] = useState({
    title: tournament?.title || "",
    organizer: tournament?.organizer || (localStorage.getItem("role") === "owner" ? localStorage.getItem("email") : ""),
    location: tournament?.location || "",
    date: tournament?.date || "",
    start_date: formatDate(tournament?.start_date),
    end_date: formatDate(tournament?.end_date),
    registration_deadline: formatDate(tournament?.registration_deadline),
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
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSubmitted(true);

    // Detailed Validation
    const requiredKeys = fields.filter(f => f.label.includes('*')).map(f => f.key);
    requiredKeys.push('description');

    const isAnyEmpty = requiredKeys.some(key => !form[key] || String(form[key]).trim() === "");
    if (isAnyEmpty) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.title.trim().length < 5) {
      setError("Tournament title must be at least 5 characters long.");
      return;
    }

    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);
    const deadlineDate = new Date(form.registration_deadline);

    if (startDate > endDate) {
      setError("Start date cannot be after the end date.");
      return;
    }

    if (deadlineDate >= startDate) {
      setError("Registration deadline must be before the tournament start date.");
      return;
    }

    if (parseInt(form.team_limit) < 4) {
      setError("Minimum team limit should be at least 4 teams for a valid tournament.");
      return;
    }

    const phoneRegex = /^(98|97)\d{8}$/;
    if (form.contact_phone && !phoneRegex.test(form.contact_phone)) {
      setError("Please enter a valid 10-digit phone number (98XXXXXXXX).");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add all text fields to FormData
      Object.entries(form).forEach(([k, v]) => {
        formData.append(k, v);
      });
      
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
    { key: "registration_deadline", label: "Registration Deadline *", type: "date" },
    { key: "prize_pool", label: "Prize Pool * (e.g. Rs 1,00,000)" },
    { key: "entry_fee", label: "Entry Fee * (e.g. Rs 5,000)" },
    { key: "team_limit", label: "Team Limit *", type: "number" },
    { key: "format", label: "Format * (e.g. Knockout, League)" },
    { key: "contact_phone", label: "Contact Phone" },
  ];

  const isFieldMissing = (key) => submitted && !form[key] && (key === 'description' || fields.find(f => f.key === key)?.label.includes('*'));

  return (
    <Modal title={tournament ? "Edit Tournament" : "Create Tournament"} onClose={onClose}>
      <div className="space-y-4">
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label className="text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
              <span>{label}</span>
              {isFieldMissing(key) && <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Required</span>}
            </label>
            <input
              type={type || "text"}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
                isFieldMissing(key) ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
          </div>
        ))}

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
            <span>Description *</span>
            {isFieldMissing('description') && <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Required</span>}
          </label>
          <textarea 
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none transition-colors ${
              isFieldMissing('description') ? "border-red-300 bg-red-50" : "border-gray-300"
            }`} 
          />
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

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Registration Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
              <option>Registration Open</option>
              <option>Registration Closed</option>
              <option>Completed</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1 italic">Note: Tournament State (Upcoming/Ongoing/Past) is managed automatically based on dates.</p>
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