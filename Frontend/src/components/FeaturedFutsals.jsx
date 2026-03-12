import { FutsalCard } from "./FutsalCard";
import futsalsData from "../data/futsals.json";

export function FeaturedFutsals({ excludeId, title = "Featured Futsal", limit = 3 }) {
  const featured = futsalsData
    .filter((f) => f.id !== excludeId)
    .slice(0, limit);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 md:mb-12">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featured.map((court) => (
            <FutsalCard key={court.id} court={court} />
          ))}
        </div>
      </div>
    </section>
  );
}
