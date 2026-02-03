import { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  Zap,
  Users,
  Shield,
  DollarSign,
  Smartphone,
  TrendingUp,
  BarChart3,
  CreditCard,
  Settings,
  CheckCircle2,
  FileCheck,
  Target,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { FutsalCard } from "../components/FutsalCard";
import { BenefitCard } from "../components/BenefitCard";
import { StepCard } from "../components/StepCard";
import { Footer } from "../components/Footer";

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = [
    '06:00 AM - 07:00 AM',
    '07:00 AM - 08:00 AM',
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM',
    '09:00 PM - 10:00 PM',
  ];

  const futsalCourts = [
    {
      id: 1,
      name: "Nepal Futsal",
      location: "Sankhamul, Kathmandu",
      price: 1200,
      rating: 4,
      reviews: 45,
      image:
        "https://images.unsplash.com/photo-1760174053338-4def27153cb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXRzYWwlMjBjb3VydCUyMGluZG9vcnxlbnwxfHx8fDE3NjgyNzk2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 2,
      name: "Nepal Futsal",
      location: "Sankhamul, Kathmandu",
      price: 1200,
      rating: 4,
      reviews: 45,
      image:
        "https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NjgyMjg3OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      name: "Nepal Futsal",
      location: "Sankhamul, Kathmandu",
      price: 1200,
      rating: 4,
      reviews: 45,
      image:
        "https://images.unsplash.com/photo-1758634025517-782312745372?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjb3VydCUyMG91dGRvb3J8ZW58MXx8fHwxNzY4MzIwMzk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const playerBenefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant & Real-Time Booking",
      description:
        "PitchPal shows real-time availability, so you can book your preferred futsal court instantly without calls, delays, or double bookings.",
      gradient: "from-amber-50 to-amber-100",
      iconBg: "bg-amber-500",
      borderColor: "border-amber-200",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Easy & User-Friendly Experience",
      description:
        "With a clean, mobile-first design, PitchPal makes searching, comparing, and booking futsal courts fast and effortless for everyone.",
      gradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      borderColor: "border-blue-200",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Wide Choice of Futsal Courts",
      description:
        "Discover multiple futsal venues in one place, compare prices, locations, facilities, and choose the pitch that fits your game.",
      gradient: "from-green-50 to-green-100",
      iconBg: "bg-green-500",
      borderColor: "border-green-200",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Flexible Payments",
      description:
        "Safe and reliable payment options ensure hassle-free transactions and instant booking confirmation.",
      gradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      borderColor: "border-purple-200",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Transparent Pricing",
      description:
        "No hidden costs. What you see is exactly what you pay, building trust for both players and owners.",
      gradient: "from-pink-50 to-pink-100",
      iconBg: "bg-pink-500",
      borderColor: "border-pink-200",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Anytime, Anywhere Access",
      description:
        "Book matches on the go—PitchPal works smoothly across mobile, tablet, and desktop devices.",
      gradient: "from-cyan-50 to-cyan-100",
      iconBg: "bg-cyan-500",
      borderColor: "border-cyan-200",
    },
  ];

  const ownerBenefits = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Increase Visibility",
      description:
        "PitchPal helps your futsal court reach more players by listing your venue on a dedicated booking platform, increasing exposure beyond walk-ins and phone calls.",
      gradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-500",
      borderColor: "border-orange-200",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-Time Slot Management",
      description:
        "Owners can manage court availability in real time, ensuring slots are always accurate and eliminating the risk of double bookings.",
      gradient: "from-indigo-50 to-indigo-100",
      iconBg: "bg-indigo-500",
      borderColor: "border-indigo-200",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Automated Bookings",
      description:
        "The system automatically handles bookings and confirmations, reducing manual workload and allowing owners to focus on operations.",
      gradient: "from-teal-50 to-teal-100",
      iconBg: "bg-teal-500",
      borderColor: "border-teal-200",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Business Insights & Analytics",
      description:
        "PitchPal provides clear analytics on bookings, peak hours, and revenue, helping owners make informed business decisions.",
      gradient: "from-violet-50 to-violet-100",
      iconBg: "bg-violet-500",
      borderColor: "border-violet-200",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Secure & Transparent Payments",
      description:
        "All payments are processed securely, with clear records of transactions for better financial tracking and trust.",
      gradient: "from-rose-50 to-rose-100",
      iconBg: "bg-rose-500",
      borderColor: "border-rose-200",
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Easy Court & Pricing Management",
      description:
        "Owners can easily add, update, or remove courts, set prices, and manage facilities without technical complexity.",
      gradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500",
      borderColor: "border-emerald-200",
    },
  ];

  const ownerSteps = [
    {
      icon: <FileCheck className="w-12 h-12" />,
      title: "Register Your Futsal",
      description:
        "Sign up by providing basic futsal details and a few required documents for verification.",
      gradient: "from-yellow-100 to-yellow-200",
      iconBg: "bg-yellow-500",
      number: "1",
    },
    {
      icon: <CheckCircle2 className="w-12 h-12" />,
      title: "Get Verified and approved",
      description:
        "Our team reviews your submission to ensure quality and trust before making your futsal live.",
      gradient: "from-green-100 to-green-200",
      iconBg: "bg-green-500",
      number: "2",
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Manage and grow easily",
      description:
        "Manage bookings, availability, pricing, and earnings from one simple dashboard.",
      gradient: "from-cyan-100 to-cyan-200",
      iconBg: "bg-cyan-500",
      number: "3",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-16 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  PP
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-gray-900 hover:text-green-600 transition-colors font-semibold"
              >
                Home
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Browse Futsal Courts
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Tournaments
              </a>
            </div>

            {/* User Profile / Mobile Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Srijan shrestha
                  </p>
                  <p className="text-xs text-gray-500 hover:text-green-600 cursor-pointer transition-colors">
                    View Profile
                  </p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              <a
                href="#"
                className="block px-4 py-2 text-gray-900 hover:bg-green-50 rounded-lg font-semibold"
              >
                Home
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-600 hover:bg-green-50 rounded-lg"
              >
                Browse Futsal Courts
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-600 hover:bg-green-50 rounded-lg"
              >
                Tournaments
              </a>
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Srijan shrestha
                  </p>
                  <p className="text-xs text-gray-500">
                    View Profile
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20px 20px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 md:space-y-8">
            {/* Title */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-2xl md:text-xl lg:text-6xl font-bold">
                Pitch Pal
              </h1>
              <h2 className="text-4xl md:text-6xl lg:text-6xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Find. Book. Play. Futsal Made Simple
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
                Search nearby futsal courts, check real-time
                availability, and book your preferred time slot
                instantly through Pitch Pal.
              </p>
            </div>

            {/* Search Form */}
            <div className="mt-8 md:mt-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 lg:p-8 max-w-5xl mx-auto border border-white/20 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Location */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-white">
                      <MapPin className="w-6 h-6 md:w-7 md:h-7" />
                      <span className="font-medium text-lg md:text-xl">
                        Location
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="KamalPokhari"
                      className="w-full px-4 py-3 md:py-3.5 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 border-2 border-transparent focus:border-green-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-white">
                      <Calendar className="w-6 h-6 md:w-7 md:h-7" />
                      <span className="font-medium text-lg md:text-xl">
                        Date
                      </span>
                    </div>
                    <input
                      type="date"
                      defaultValue="2025-11-04"
                      className="w-full px-4 py-3 md:py-3.5 rounded-lg bg-white/90 text-gray-800 border-2 border-transparent focus:border-green-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-white">
                      <Clock className="w-6 h-6 md:w-7 md:h-7" />
                      <span className="font-medium text-lg md:text-xl">
                        Time
                      </span>
                    </div>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 md:py-3.5 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 border-2 border-transparent focus:border-green-500 focus:outline-none transition-all"
                    >
                      <option value="">Select Time Slot</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button className="w-full mt-6 md:mt-8 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium text-lg md:text-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Search Futsal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Futsal Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 md:mb-16">
            Featured Futsal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {futsalCourts.map((court) => (
              <FutsalCard key={court.id} court={court} />
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-10 md:mt-12">
            <button className="px-8 py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              View more Futsals
            </button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 md:mb-16">
            How it works
          </h2>
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NjgyMjg3OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="How it works diagram"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose PitchPal Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-4">
            Why choose PitchPal for your Futsal booking app?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12 md:mb-16">
            Experience seamless booking with features designed
            for players
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {playerBenefits.map((benefit, index) => (
              <BenefitCard key={index} benefit={benefit} />
            ))}
          </div>
        </div>
      </section>

      {/* Owner Benefits Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why use Pitch Pal as an Owner
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mb-12 md:mb-16">
            Powerful tools to manage your futsal business
            efficiently
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {ownerBenefits.map((benefit, index) => (
              <BenefitCard key={index} benefit={benefit} />
            ))}
          </div>
        </div>
      </section>

      {/* How to use PitchPal as Owner */}
      <section className="py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 md:mb-16">
            How to use PitchPal as an Owner?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-green-300 to-cyan-300 transform -translate-y-1/2 mx-[10%]"></div>

            {ownerSteps.map((step, index) => (
              <StepCard key={index} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* Book your Futsal without any hassle */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 md:mb-8">
            Book your Futsal without any hassle
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Take your futsal online and manage bookings,
            availability, and earnings easily with PitchPal.
          </p>
          <button className="px-10 py-4 md:px-12 md:py-5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium text-lg md:text-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl inline-flex items-center space-x-2">
            <span>Sign up Futsal</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;