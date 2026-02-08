import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Clock } from "lucide-react";
import api from "../api/axios";
import { FutsalCard } from "../components/FutsalCard";
import { BenefitCard } from "../components/BenefitCard";
import { Zap, Users, Shield, DollarSign, Smartphone, Target } from "lucide-react";
import futsalsData from "../data/futsals.json"; // Import mock data

export default function BrowseFutsal() {
    // --- Filters / UI state ---
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [sortBy, setSortBy] = useState("recommended");

    // --- Data state (NOT hard-coded) ---
    const [courts, setCourts] = useState([]); // will be filled by backend later
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const playerBenefits = [
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Instant & Real-Time Booking",
            description:
                "See real-time availability and book instantly without calls, delays, or double bookings.",
            gradient: "from-amber-50 to-amber-100",
            iconBg: "bg-amber-500",
            borderColor: "border-amber-200",
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Easy & User-Friendly Experience",
            description:
                "Search, compare, and book futsal courts fast with a clean mobile-first UI.",
            gradient: "from-blue-50 to-blue-100",
            iconBg: "bg-blue-500",
            borderColor: "border-blue-200",
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Wide Choice of Futsal Courts",
            description:
                "Browse multiple venues in one place and choose the pitch that fits your game.",
            gradient: "from-green-50 to-green-100",
            iconBg: "bg-green-500",
            borderColor: "border-green-200",
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Secure & Flexible Payments",
            description:
                "Safe payment options with instant confirmation for a smooth booking experience.",
            gradient: "from-purple-50 to-purple-100",
            iconBg: "bg-purple-500",
            borderColor: "border-purple-200",
        },
        {
            icon: <DollarSign className="w-8 h-8" />,
            title: "Transparent Pricing",
            description:
                "No hidden costs — what you see is what you pay.",
            gradient: "from-pink-50 to-pink-100",
            iconBg: "bg-pink-500",
            borderColor: "border-pink-200",
        },
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: "Anytime, Anywhere Access",
            description:
                "Book on mobile, tablet, or desktop — wherever you are.",
            gradient: "from-cyan-50 to-cyan-100",
            iconBg: "bg-cyan-500",
            borderColor: "border-cyan-200",
        },
    ];

    // Same time slots you used on Home
    const timeSlots = useMemo(
        () => [
            "06:00 AM - 07:00 AM",
            "07:00 AM - 08:00 AM",
            "08:00 AM - 09:00 AM",
            "09:00 AM - 10:00 AM",
            "10:00 AM - 11:00 AM",
            "11:00 AM - 12:00 PM",
            "12:00 PM - 01:00 PM",
            "01:00 PM - 02:00 PM",
            "02:00 PM - 03:00 PM",
            "03:00 PM - 04:00 PM",
            "04:00 PM - 05:00 PM",
            "05:00 PM - 06:00 PM",
            "06:00 PM - 07:00 PM",
            "07:00 PM - 08:00 PM",
            "08:00 PM - 09:00 PM",
            "09:00 PM - 10:00 PM",
        ],
        []

    );

    // --- Backend fetch (ready for later) ---
    const fetchCourts = async (filters = {}) => {
        setLoading(true);
        setError("");
        try {
            /**
             * ✅ When backend is ready, uncomment this and use your real endpoint:
             * const res = await api.get("/futsals/", { params: filters });
             * setCourts(res.data);
             */

            // Simulate network delay
            // await new Promise(resolve => setTimeout(resolve, 500));
            
            // Client-side filtering for mock data
            let filtered = [...futsalsData];
            if (filters.search) {
                const q = filters.search.toLowerCase();
                filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
            }
            if (filters.location) {
                const q = filters.location.toLowerCase();
                filtered = filtered.filter(c => c.location.toLowerCase().includes(q));
            }
            if (filters.sort === "price_low") {
                filtered.sort((a, b) => a.price - b.price);
            } else if (filters.sort === "price_high") {
                filtered.sort((a, b) => b.price - a.price);
            } else if (filters.sort === "rating") {
                filtered.sort((a, b) => b.rating - a.rating);
            }
            
            setCourts(filtered);
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Failed to load futsal courts"
            );
        } finally {
            setLoading(false);
        }
    };

    // Initial load (later: load all courts)
    useEffect(() => {
        fetchCourts({
            search: "",
            location: "",
            time: "",
            sort: "recommended",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearchSubmit = (e) => {
        e.preventDefault();
        fetchCourts({
            search,
            location,
            time: selectedTime,
            sort: sortBy,
        });
    };

    // Bottom benefits section (static UI is OK)
    const benefits = [
        {
            title: "Real-time availability",
            description: "See which futsal courts are available instantly before booking.",
            iconBg: "bg-green-600",
            borderColor: "border-green-200",
            gradient: "from-green-50 to-white",
        },
        {
            title: "Easy search & filters",
            description: "Search by name, location, and time slot in seconds.",
            iconBg: "bg-green-600",
            borderColor: "border-green-200",
            gradient: "from-green-50 to-white",
        },
        {
            title: "Secure booking process",
            description: "A smooth experience from browsing to confirmation.",
            iconBg: "bg-green-600",
            borderColor: "border-green-200",
            gradient: "from-green-50 to-white",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Filter row (below main Navbar) */}
            <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <form
                        onSubmit={onSearchSubmit}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                    >
                        {/* Search */}
                        <div className="md:col-span-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search futsal"
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="md:col-span-3">
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Location"
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <div className="md:col-span-3">
                            <div className="relative">
                                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option value="">Time</option>
                                    {timeSlots.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="md:col-span-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="recommended">Sort</option>
                                <option value="price_low">Price: low → high</option>
                                <option value="price_high">Price: high → low</option>
                                <option value="rating">Rating</option>
                            </select>
                        </div>

                        {/* Submit */}
                        <div className="md:col-span-1 flex justify-end">
                            <button
                                type="submit"
                                className="w-full md:w-auto px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                            >
                                Search
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* Main list */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {String(error)}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-gray-200 overflow-hidden bg-white animate-pulse"
                            >
                                <div className="h-64 bg-gray-100" />
                                <div className="p-5 space-y-3">
                                    <div className="h-5 bg-gray-100 rounded w-2/3" />
                                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                                    <div className="h-10 bg-gray-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courts.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
                        <p className="text-lg font-semibold text-gray-900">
                            No futsal courts to show yet
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            When you connect the backend, this page will load courts dynamically.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courts.map((court) => (
                                <FutsalCard key={court.id} court={court} />
                            ))}
                        </div>

                        <div className="flex justify-center mt-10">
                            <button
                                onClick={() =>
                                    fetchCourts({
                                        search,
                                        location,
                                        time: selectedTime,
                                        sort: sortBy,
                                    })
                                }
                                className="px-8 py-3.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-colors"
                            >
                                View more
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section className="py-12 md:py-20 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-4">
                        Why book with PitchPal?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12 md:mb-16">
                        Experience seamless booking with features designed for players
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {playerBenefits.map((benefit, index) => (
                            <BenefitCard key={index} benefit={benefit} />
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
