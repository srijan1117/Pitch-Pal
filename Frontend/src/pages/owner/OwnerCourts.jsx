import { useState } from "react";
import { Plus, Home } from "lucide-react";
import CourtCard from "../../components/owner/CourtCard";
import CourtModal from "../../components/owner/CourtModal";
import SlotModal from "../../components/owner/SlotModal";
import GalleryModal from "../../components/owner/GalleryModal";
import ConfirmDialog from "../../components/owner/ConfirmDialog";
import api from "../../api/axios";

export default function OwnerCourts({ courts, onRefresh }) {
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);


  const [confirmCourtId, setConfirmCourtId] = useState(null);
  const [confirmSlotId, setConfirmSlotId] = useState(null);

  // These functions allow the owner to delete their courts or time slots from the database.
  // After a successful deletion, we 'onRefresh()' the data so the list updates instantly.
  const handleDeleteCourt = async () => {
    try {
      await api.delete(`/futsal/courts/${confirmCourtId}/`);
      setConfirmCourtId(null);
      onRefresh();
    } catch {
      alert("Failed to delete court.");
      setConfirmCourtId(null);
    }
  };

  const handleDeleteSlot = async () => {
    try {
      await api.delete(`/futsal/slots/${confirmSlotId}/`);
      setConfirmSlotId(null);
      onRefresh();
    } catch {
      alert("Failed to delete slot.");
      setConfirmSlotId(null);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Courts</h2>
        <button
          onClick={() => { setEditingCourt(null); setShowCourtModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Court
        </button>
      </div>


      {courts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No courts yet</p>
          <p className="text-gray-400 text-sm">Add your first futsal court to get started.</p>
          <button
            onClick={() => { setEditingCourt(null); setShowCourtModal(true); }}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            Add Your First Court
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courts.map(court => (
            <CourtCard
              key={court.id}
              court={court}
              onEdit={() => { setEditingCourt(court); setShowCourtModal(true); }}
              onDelete={() => setConfirmCourtId(court.id)}
              onAddSlot={() => { setSelectedCourt(court); setShowSlotModal(true); }}
              onDeleteSlot={(slotId) => setConfirmSlotId(slotId)}
              onManageGallery={() => { setSelectedCourt(court); setShowGalleryModal(true); }}
            />
          ))}
        </div>
      )}


      {showCourtModal && (
        <CourtModal
          court={editingCourt}
          onClose={() => setShowCourtModal(false)}
          onSuccess={onRefresh}
        />
      )}

      {showSlotModal && selectedCourt && (
        <SlotModal
          court={selectedCourt}
          onClose={() => setShowSlotModal(false)}
          onSuccess={onRefresh}
        />
      )}

      {showGalleryModal && selectedCourt && (
        <GalleryModal
          court={courts.find(c => c.id === selectedCourt.id) || selectedCourt}
          onClose={() => setShowGalleryModal(false)}
          onSuccess={onRefresh}
        />
      )}


      {confirmCourtId && (
        <ConfirmDialog
          title="Delete Court"
          message="Are you sure you want to delete this court? All slots and bookings will be lost. This cannot be undone."
          onConfirm={handleDeleteCourt}
          onCancel={() => setConfirmCourtId(null)}
        />
      )}


      {confirmSlotId && (
        <ConfirmDialog
          title="Delete Time Slot"
          message="Are you sure you want to delete this time slot?"
          onConfirm={handleDeleteSlot}
          onCancel={() => setConfirmSlotId(null)}
        />
      )}
    </div>
  );
}