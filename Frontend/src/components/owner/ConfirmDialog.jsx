import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ title = "Confirm Delete", message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition text-sm">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}