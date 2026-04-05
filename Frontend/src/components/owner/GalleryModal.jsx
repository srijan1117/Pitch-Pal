import { useState } from "react";
import { Trash2 } from "lucide-react";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import api from "../../api/axios";

export default function GalleryModal({ court, onClose, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmImageId, setConfirmImageId] = useState(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("images", f));
      await api.post(`/futsal/courts/${court.id}/images/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.ErrorMessage;
      setError(typeof msg === "string" ? msg : "Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/futsal/courts/${court.id}/images/?image_id=${confirmImageId}`);
      setConfirmImageId(null);
      onSuccess();
    } catch {
      setError("Failed to delete image.");
      setConfirmImageId(null);
    }
  };

  const remaining = 4 - (court.gallery?.length || 0);

  return (
    <>
      <Modal title={`Gallery — ${court.name}`} onClose={onClose}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {court.gallery?.length || 0}/4 photos uploaded.
          </p>

          {court.gallery?.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {court.gallery.map(img => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-100">
                  <img src={img.image} alt="gallery" className="w-full h-32 object-cover" />
                  <button
                    onClick={() => setConfirmImageId(img.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {remaining > 0 ? (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Upload Photos{" "}
                <span className="text-gray-400 font-normal">
                  ({remaining} slot{remaining > 1 ? "s" : ""} remaining)
                </span>
              </label>
              <input
                type="file" accept="image/*" multiple
                onChange={handleUpload} disabled={uploading}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold hover:file:bg-green-100"
              />
              {uploading && <p className="text-sm text-green-600 mt-2 animate-pulse">Uploading...</p>}
            </div>
          ) : (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg font-medium">
              Maximum 4 photos reached. Delete a photo to upload a new one.
            </p>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

          <button onClick={onClose}
            className="w-full py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition">
            Close
          </button>
        </div>
      </Modal>

      {confirmImageId && (
        <ConfirmDialog
          title="Delete Photo"
          message="Are you sure you want to delete this photo? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmImageId(null)}
        />
      )}
    </>
  );
}