import { XCircle, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

export default function CancelBookingModal({ isOpen, onClose, onConfirm, bookingId }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-50 rounded-2xl mb-6 rotate-3">
            <XCircle className="w-8 h-8 text-red-600 -rotate-3" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">Cancel Booking</h2>
          <p className="text-center text-gray-500 text-base mb-8 leading-relaxed">
            Are you sure you want to cancel booking <span className="font-mono font-bold text-gray-900">#BK-{bookingId}</span>? 
            <br />
            <span className="text-sm mt-2 block text-red-500 font-medium">This action cannot be undone.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
            >
              No, Keep It
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
        
        {/* Warning Footer */}
        <div className="bg-amber-50 px-8 py-4 flex items-start gap-3 border-t border-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium leading-normal">
            Note: Cancellation policies may apply. If you've already paid, the refund will be processed according to the futsal's policy.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
