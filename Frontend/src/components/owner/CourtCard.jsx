import { useState } from "react";
import { Edit2, Trash2, Plus, Image, ChevronDown, ChevronUp } from "lucide-react";


export default function CourtCard({ court, onEdit, onDelete, onAddSlot, onDeleteSlot, onManageGallery }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Court Image */}
        {court.image ? (
          <img src={court.image} alt={court.name}
            className="w-full sm:w-48 h-40 sm:h-auto object-cover shrink-0" />
        ) : (
          <div className="w-full sm:w-48 h-40 sm:h-auto bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shrink-0">
            <span className="text-green-600 font-bold text-4xl">{court.name?.charAt(0)}</span>
          </div>
        )}

        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">{court.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  court.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {court.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{court.address}</p>
              <p className="text-sm font-bold text-green-700">Rs {court.price_per_hour}/hr</p>

              {/* Amenities */}
              {court.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {court.amenities.map(a => (
                    <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{a}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Edit court">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete court">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={onAddSlot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
              <Plus className="w-3 h-3" /> Add Slot
            </button>
            <button onClick={onManageGallery}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">
              <Image className="w-3 h-3" /> Gallery ({court.gallery?.length || 0}/4)
            </button>
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-100 transition">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Slots ({court.time_slots?.length || 0})
            </button>
          </div>

          {/* Expandable slots */}
          {expanded && (
            <div className="mt-4 space-y-2">
              {court.time_slots?.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No slots yet. Add your first slot!</p>
              ) : (
                court.time_slots?.map(slot => (
                  <div key={slot.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                      </span>
                      {slot.price && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          Rs {slot.price}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${slot.is_available ? "text-green-600" : "text-gray-400"}`}>
                        {slot.is_available ? "Available" : "Unavailable"}
                      </span>
                      <button onClick={() => onDeleteSlot(slot.id)}
                        className="text-gray-300 hover:text-red-500 transition p-1 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}