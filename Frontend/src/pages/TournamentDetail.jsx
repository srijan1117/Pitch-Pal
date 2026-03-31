import { useParams, Link, useNavigate } from "react-router-dom";
import { Trophy, Calendar, MapPin, Users, ArrowLeft, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Footer } from "../components/Footer";
import api from "../api/axios";
import { isLoggedIn } from "../api/auth";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [playerNames, setPlayerNames] = useState(["", "", "", "", ""]);
  const [registering, setRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");

  useEffect(() => {
    api.get(`/futsal/tournaments/${id}/`)
      .then(res => setTournament(res.data?.Result))
      .catch(() => setError("Tournament not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayerChange = (index, value) => {
    const updated = [...playerNames];
    updated[index] = value;
    setPlayerNames(updated);
  };

  const handleRegister = async () => {
    if (!isLoggedIn()) { navigate("/login"); return; }
    if (!teamName || !contactPhone) { setRegError("Team name and contact phone are required."); return; }

    setRegistering(true);
    setRegError("");
    setRegSuccess("");

    try {
      await api.post("/futsal/tournaments/register/", {
        tournament: parseInt(id),
        team_name: teamName,
        contact_phone: contactPhone,
        player_names: playerNames.filter(p => p.trim() !== ""),
      });
      setRegSuccess("Registration successful! Your team has been registered.");
      setIsModalOpen(false);
      // Refresh tournament data to update registered_teams count
      const res = await api.get(`/futsal/tournaments/${id}/`);
      setTournament(res.data?.Result);
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      setRegError(typeof msg === "string" ? msg : JSON.stringify(msg) || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <Trophy className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h1>
        <Link to="/tournaments" className="text-green-600 hover:underline font-medium">Back to Tournaments</Link>
      </div>
    );
  }

  const isOpen = tournament.status === "Registration Open";
  const isHistory = tournament.state === "history";
  const isOngoing = tournament.state === "ongoing";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <main className="flex-grow w-full pb-16">

        {/* Hero Image */}
        <div className="relative h-64 md:h-96 w-full">
          <img
            src={tournament.image || "https://images.unsplash.com/photo-1518605348400-437731df48d4?q=80&w=2070"}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          <div className="absolute top-6 left-4 sm:left-6 lg:left-8">
            <Link to="/tournaments" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  isOpen ? "bg-green-500 text-white" : isHistory ? "bg-gray-500 text-white" : "bg-red-500 text-white"
                }`}>{tournament.status}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">{tournament.format}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight">{tournament.title}</h1>
              <p className="text-lg text-gray-300 font-medium">Organized by <span className="text-white">{tournament.organizer}</span></p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tournament Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Date & Duration</p>
                      <p className="font-semibold text-gray-900">{tournament.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Location</p>
                      <p className="font-semibold text-gray-900">{tournament.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center shrink-0">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Prize Pool</p>
                      <p className="font-semibold text-gray-900 text-lg">{tournament.prize_pool}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Team Limit</p>
                      <p className="font-semibold text-gray-900">{tournament.team_limit} Teams Maximum</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Tournament</h2>
                <p className="text-gray-600 mb-6">{tournament.description}</p>
                {tournament.rules?.length > 0 && (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Rules & Regulations</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      {tournament.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Registration Details</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Entry Fee</span>
                    <span className="font-bold text-gray-900 text-lg">{tournament.entry_fee}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">Registered Teams</span>
                      <span className="font-bold text-gray-900">{tournament.registered_teams} / {tournament.team_limit}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`}
                        style={{ width: `${Math.min((tournament.registered_teams / tournament.team_limit) * 100, 100)}%` }}
                      />
                    </div>
                    {isOpen && (
                      <p className="text-xs text-green-600 font-medium mt-2 text-right">
                        {tournament.team_limit - tournament.registered_teams} slots remaining!
                      </p>
                    )}
                  </div>
                </div>

                {regSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{regSuccess}</div>}

                {isOpen ? (
                  <button onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                    Register Team Now
                  </button>
                ) : isOngoing ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-bold text-blue-900">Tournament is Ongoing</p>
                    <p className="text-sm text-blue-700 mt-1">Registration is closed.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">Tournament Completed</p>
                    <p className="text-sm text-gray-500 mt-1">This event has concluded.</p>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-2">Need Help?</p>
                  <p className="text-sm text-gray-500">Contact the organizer at:</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">{tournament.contact_phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Register Your Team</h2>
            <p className="text-sm text-gray-500 mb-6">Tournament: <span className="font-semibold text-gray-800">{tournament.title}</span></p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                <input value={teamName} onChange={e => setTeamName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter team name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="98XXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Player Names</label>
                {playerNames.map((name, i) => (
                  <input key={i} value={name} onChange={e => handlePlayerChange(i, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none mb-2"
                    placeholder={`Player ${i + 1}`} />
                ))}
              </div>
            </div>

            {regError && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{regError}</div>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleRegister} disabled={registering}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all disabled:opacity-50">
                {registering ? "Registering..." : "Confirm Registration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}