import { useState } from "react";
import { X, Users, Phone, ShieldCheck, Trophy, Info } from "lucide-react";

export function TournamentRegistrationModal({ tournament, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    contactNumber: "",
    email: "",
    players: ["", "", "", "", ""], // Minimum 5 players
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...formData.players];
    newPlayers[index] = value;
    setFormData((prev) => ({ ...prev, players: newPlayers }));
  };

  const addPlayer = () => {
    if (formData.players.length < 10) {
      setFormData((prev) => ({ ...prev, players: [...prev.players, ""] }));
    }
  };

  const removePlayer = (index) => {
    if (formData.players.length > 5) {
      const newPlayers = formData.players.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, players: newPlayers }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(formData);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gray-900 px-6 py-6 sm:px-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Team Registration</h2>
              <p className="text-gray-400 text-sm">{tournament.title}</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Team Info */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  General Information
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Team Name</label>
                  <input
                    required
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    placeholder="Enter your team's name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Captain Info */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Captain Name</label>
                <input
                  required
                  name="captainName"
                  value={formData.captainName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Players Section */}
              <div className="space-y-4 md:col-span-2 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    Squad Members
                  </h3>
                  <button
                    type="button"
                    onClick={addPlayer}
                    disabled={formData.players.length >= 10}
                    className="text-sm font-bold text-green-600 hover:text-green-700 disabled:text-gray-400"
                  >
                    + Add Player
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.players.map((player, idx) => (
                    <div key={idx} className="relative group">
                      <input
                        required
                        value={player}
                        onChange={(e) => handlePlayerChange(idx, e.target.value)}
                        placeholder={`Player ${idx + 1} Name ${idx === 0 ? "(Captain)" : ""}`}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                      />
                      {idx >= 5 && (
                        <button
                          type="button"
                          onClick={() => removePlayer(idx)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Info */}
            <div className="mt-8 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                A non-refundable entry fee of <span className="font-bold">{tournament.entryFee}</span> is required to confirm your registration. Payment details will be shared after submission.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-6 py-3.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Registration"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
