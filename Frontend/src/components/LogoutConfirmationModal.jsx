import { LogOut } from "lucide-react";
import { createPortal } from "react-dom";

export default function LogoutConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <LogOut className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Sign out</h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Are you sure you would like to sign out of your account?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 border border-transparent text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}