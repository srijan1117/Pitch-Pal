import { useState } from "react";
import { Trophy, Calendar, MapPin, Users, ChevronRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import tournamentsData from "../data/tournaments.json";

function TournamentCard({ tournament }) {
  const isOpen = tournament.status === "Registration Open";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={tournament.image}
          alt={tournament.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
            isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {tournament.status}
          </span>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white leading-tight mb-1">
            {tournament.title}
          </h3>
          <p className="text-gray-300 text-sm font-medium flex items-center gap-1">
            By {tournament.organizer}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
            <span className="text-sm">{tournament.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-medium">{tournament.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="text-sm font-bold text-gray-900">Prize: {tournament.prizePool}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Entry Fee</p>
            <p className="text-sm font-semibold text-gray-900">{tournament.entryFee}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Format</p>
            <p className="text-sm font-semibold text-gray-900">{tournament.format}</p>
          </div>
          <div className="col-span-2 pt-2 border-t border-gray-200 mt-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Registered Teams
              </span>
              <span className="font-semibold text-gray-900">
                {tournament.registeredTeams} / {tournament.teamLimit}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-500'}`} 
                style={{ width: `${(tournament.registeredTeams / tournament.teamLimit) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link 
            to={`/tournaments/${tournament.id}`}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isOpen 
                ? "bg-gray-900 text-white hover:bg-black active:scale-95 shadow-md hover:shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
            }`}
          >
            {isOpen ? "Register Now" : "View Details"}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Tournaments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleUpcoming, setVisibleUpcoming] = useState(3);
  const [visibleOngoing, setVisibleOngoing] = useState(3);
  const [visibleHistory, setVisibleHistory] = useState(3);

  const filteredTournaments = tournamentsData.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const upcomingTournaments = filteredTournaments.filter(t => t.state === "upcoming");
  const ongoingTournaments = filteredTournaments.filter(t => t.state === "ongoing");
  const historyTournaments = filteredTournaments.filter(t => t.state === "history");

  // Reset visible counts when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setVisibleUpcoming(3);
    setVisibleOngoing(3);
    setVisibleHistory(3);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <main className="flex-grow w-full">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search tournaments by name or location..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Tournaments
            </h2>
            <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-lg text-sm">
              {filteredTournaments.length} Results
            </span>
          </div>

          {filteredTournaments.length > 0 ? (
            <div className="space-y-16">
              {/* Ongoing Tournaments */}
              {ongoingTournaments.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <h3 className="text-2xl font-bold text-gray-900">Ongoing Tournaments</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ongoingTournaments.slice(0, visibleOngoing).map(tournament => (
                      <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                  </div>
                  {ongoingTournaments.length > 3 && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={() => setVisibleOngoing(prev => prev >= ongoingTournaments.length ? 3 : prev + 3)}
                        className="px-8 py-3.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-colors"
                      >
                        {visibleOngoing >= ongoingTournaments.length ? "View less" : "View more"}
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* Upcoming Tournaments */}
              {upcomingTournaments.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h3 className="text-2xl font-bold text-gray-900">Upcoming Tournaments</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingTournaments.slice(0, visibleUpcoming).map(tournament => (
                      <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                  </div>
                  {upcomingTournaments.length > 3 && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={() => setVisibleUpcoming(prev => prev >= upcomingTournaments.length ? 3 : prev + 3)}
                        className="px-8 py-3.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-colors"
                      >
                        {visibleUpcoming >= upcomingTournaments.length ? "View less" : "View more"}
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* History Tournaments */}
              {historyTournaments.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <h3 className="text-2xl font-bold text-gray-900">Past Tournaments</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {historyTournaments.slice(0, visibleHistory).map(tournament => (
                      <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                  </div>
                  {historyTournaments.length > 3 && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={() => setVisibleHistory(prev => prev >= historyTournaments.length ? 3 : prev + 3)}
                        className="px-8 py-3.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-colors"
                      >
                        {visibleHistory >= historyTournaments.length ? "View less" : "View more"}
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tournaments found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
