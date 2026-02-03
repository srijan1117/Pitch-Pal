import { Star, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './ui/ImageWithFallback';

export function FutsalCard({ court }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-64 md:h-72 overflow-hidden">
        <ImageWithFallback
          src={court.image}
          alt={court.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 space-y-4">
        {/* Name and Price */}
        <div className="flex items-start justify-between">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">{court.name}</h3>
          <div className="text-right">
            <p className="text-xl md:text-2xl font-bold text-green-600">Rs {court.price}</p>
            <p className="text-sm text-gray-500">/Hour</p>
          </div>
        </div>

        {/* Location and Rating */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-gray-700 font-medium">{court.location}</p>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < court.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-300 text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{court.reviews} reviews</span>
            </div>
          </div>

          <button className="px-6 py-2.5 border-2 border-gray-800 hover:bg-green-600 hover:border-green-600 text-gray-800 hover:text-white rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-1">
            <span>View</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
