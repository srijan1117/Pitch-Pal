import { useParams, Link } from "react-router-dom";
import { Trophy, Calendar, MapPin, Users, ArrowLeft, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";
import { Footer } from "../components/Footer";
import tournamentsData from "../data/tournaments.json";
import { TournamentRegistrationModal } from "../components/TournamentRegistrationModal";

export default function TournamentDetail() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tournament = tournamentsData.find((t) => t.id === parseInt(id));

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <Trophy className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h1>
        <Link to="/tournaments" className="text-green-600 hover:underline font-medium">
          Back to Tournaments
        </Link>
      </div>
    );
  }

  const isOpen = tournament.status === "Registration Open";
  const isHistory = tournament.state === "history";
  const isOngoing = tournament.state === "ongoing";

  const handleRegistrationSubmit = (data) => {
    console.log("Registration Data:", data);
    alert(`Registration submitted for ${data.teamName}!`);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <main className="flex-grow w-full pb-16">
        
        {/* Hero Image Section */}
        <div className="relative h-64 md:h-96 w-full">
          <img 
            src={tournament.image} 
            alt={tournament.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          
          <div className="absolute top-6 left-4 sm:left-6 lg:left-8">
            <Link 
              to="/tournaments" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  isOpen ? "bg-green-500 text-white" : 
                  isHistory ? "bg-gray-500 text-white" : "bg-red-500 text-white"
                }`}>
                  {tournament.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                  {tournament.format}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight">
                {tournament.title}
              </h1>
              <p className="text-lg text-gray-300 font-medium flex items-center gap-2">
                Organized by <span className="text-white">{tournament.organizer}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content (Left) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Overview Card */}
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
                      <p className="font-semibold text-gray-900 text-lg">{tournament.prizePool}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Team Limit</p>
                      <p className="font-semibold text-gray-900">{tournament.teamLimit} Teams Maximum</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Text */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Tournament</h2>
                <div className="prose prose-gray max-w-none text-gray-600">
                  <p>{tournament.description}</p>
                  
                  <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Rules & Regulations</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {tournament.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Sidebar (Right) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                
                <h3 className="text-xl font-bold text-gray-900 mb-6">Registration Details</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Entry Fee</span>
                    <span className="font-bold text-gray-900 text-lg">{tournament.entryFee}</span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">Registered Teams</span>
                      <span className="font-bold text-gray-900">
                        {tournament.registeredTeams} / {tournament.teamLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} 
                        style={{ width: `${(tournament.registeredTeams / tournament.teamLimit) * 100}%` }}
                      ></div>
                    </div>
                    {isOpen && (
                      <p className="text-xs text-green-600 font-medium mt-2 text-right">
                        {tournament.teamLimit - tournament.registeredTeams} slots remaining!
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Area based on State */}
                {isOpen ? (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                  >
                    Register Team Now
                  </button>
                ) : isOngoing ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-bold text-blue-900">Tournament is Ongoing</p>
                    <p className="text-sm text-blue-700 mt-1">Registration is closed. Follow the matches at the venue!</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">Tournament Completed</p>
                    <p className="text-sm text-gray-500 mt-1">This event has concluded.</p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-2">Need Help?</p>
                  <p className="text-sm text-gray-500">Contact the organizer at:</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">{tournament.contactPhone}</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />

      {/* Registration Modal */}
      {isModalOpen && (
        <TournamentRegistrationModal 
          tournament={tournament} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleRegistrationSubmit}
        />
      )}
    </div>
  );
}
