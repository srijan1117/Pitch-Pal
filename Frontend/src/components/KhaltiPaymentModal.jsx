import { X, ShieldCheck, Ticket, Calendar, MapPin, RefreshCw } from "lucide-react";
import { useState } from "react";
import { initiateKhaltiPayment, initiateTournamentPayment, initiateWeeklyPayment } from "../api/payment";

export default function KhaltiPaymentModal({ booking, registration, weeklyBooking, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isTourney = !!registration;
  const isWeekly = !!weeklyBooking;
  const data = isTourney ? registration : (isWeekly ? weeklyBooking : booking);

  // Format entry fee if it's from tournament (it's often "Rs 500")
  const displayAmount = isTourney
    ? (data.tournament_detail?.entry_fee || data.tournament?.entry_fee || "N/A")
    : (isWeekly ? "Rs (First 4 Weeks)" : `Rs ${data.total_amount}`);

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      let result;
      if (isTourney) {
        result = await initiateTournamentPayment(data.id);
      } else if (isWeekly) {
        result = await initiateWeeklyPayment(data.id);
      } else {
        result = await initiateKhaltiPayment(data.id);
      }

      const isSuccess = result.IsSuccess ?? result.is_success;
      const resData = result.Result ?? result.result;

      if (isSuccess && resData?.payment_url) {
        window.location.href = resData.payment_url;
      } else {
        const errorMsg = result.ErrorMessage ?? result.error_message ?? "Failed to initiate payment. Please try again.";
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.ErrorMessage || err.response?.data?.detail || "An error occurred while connecting to Khalti. Please check your connection.";
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative h-32 bg-green-600 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
          </div>
          <img
            src="https://khalti.com/static/img/logo1.png"
            alt="Khalti"
            className="h-10 relative z-10 brightness-0 invert"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
            <p className="text-gray-500 text-sm">You are about to pay for your {isTourney ? "tournament participation" : (isWeekly ? "weekly recurring booking" : "booking")}.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                {isTourney ? <Ticket className="text-green-600 w-5 h-5" /> : (isWeekly ? <RefreshCw className="text-green-600 w-5 h-5" /> : <Calendar className="text-green-600 w-5 h-5" />)}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                  {isTourney ? "Tournament" : (isWeekly ? "Weekly Schedule" : "Court")}
                </p>
                <p className="font-bold text-gray-900 line-clamp-1">
                  {isTourney ? (data.tournament_title || data.tournament?.title) : (data.court_name || data.court_detail?.name)}
                </p>
              </div>
            </div>

            {!isTourney && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  <MapPin className="text-green-600 w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Location</p>
                  <p className="font-bold text-gray-900 line-clamp-1">
                    {data.court_address || data.court_detail?.address}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Amount</span>
              <span className="text-2xl font-black text-green-700">{displayAmount}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full h-16 bg-[#5C2D91] hover:bg-[#4a2475] disabled:bg-gray-300 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Pay with Khalti</span>
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={14} />
            Secure payment powered by Khalti
          </div>
        </div>
      </div>
    </div>
  );
}