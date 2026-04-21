import { useState } from "react";
import { Plus, Trophy, Trash2, Users, Edit2 } from "lucide-react";
import TournamentModal from "../../components/owner/TournamentModal";
import ConfirmDialog from "../../components/owner/ConfirmDialog";
import api from "../../api/axios";

export default function OwnerTournaments({ tournaments, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // This function sends a request to the backend to delete a tournament.
  // We refresh the list immediately after so the owner can see it's gone.
  const handleDelete = async () => {
    try {
      await api.delete(`/futsal/tournaments/${confirmDeleteId}/delete/`);
      setConfirmDeleteId(null);
      onRefresh();
    } catch {
      alert("Failed to delete tournament.");
      setConfirmDeleteId(null);
    }
  };

  const stateColor = {
    upcoming: "bg-green-100 text-green-700",
    ongoing: "bg-blue-100 text-blue-700",
    history: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Tournaments</h2>
        <button
          onClick={() => { setEditingTournament(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Tournament
        </button>
      </div>


      {tournaments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No tournaments yet</p>
          <p className="text-gray-400 text-sm">Create your first tournament to attract more players.</p>
          <button
            onClick={() => { setEditingTournament(null); setShowModal(true); }}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            Create Tournament
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">

              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-green-100 to-green-200">
                {t.image ? (
                  <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-green-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-12">
                  <h3 className="font-bold text-white text-sm leading-tight">{t.title}</h3>
                </div>


                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => { setEditingTournament(t); setShowModal(true); }}
                    className="bg-blue-500 text-white p-1.5 rounded-full shadow-md hover:bg-blue-600 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(t.id)}
                    className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>


              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${stateColor[t.state] || "bg-gray-100 text-gray-600"}`}>
                    {t.state}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    t.status === "Registration Open" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-1">{t.location}</p>
                <p className="text-xs text-gray-500 mb-3">{t.date}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-sm font-bold text-green-700">{t.prize_pool}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.registered_teams}/{t.team_limit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {showModal && (
        <TournamentModal
          tournament={editingTournament}
          onClose={() => { setShowModal(false); setEditingTournament(null); }}
          onSuccess={onRefresh}
        />
      )}


      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete Tournament"
          message="Are you sure you want to delete this tournament? All registrations will be lost. This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}