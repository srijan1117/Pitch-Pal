import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyEsewaPayment } from "../api/payment";

export default function EsewaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your payment with eSewa...");
  const verifyAttempted = useRef(false);

  useEffect(() => {
    // eSewa redirects with a ?data=... parameter
    const data = searchParams.get("data");

    if (verifyAttempted.current) return;
    
    if (!data) {
      setStatus("error");
      setMessage("Invalid payment callback parameters.");
      return;
    }

    const verify = async () => {
      verifyAttempted.current = true;
      try {
        const res = await verifyEsewaPayment(data);

        const isSuccess = res.IsSuccess ?? res.is_success;
        const resData = res.Result ?? res.result;

        if (isSuccess) {
          setStatus("success");
          setMessage(resData?.message || "Payment verified successfully!");
          // Redirect after 3 seconds
          setTimeout(() => {
            navigate("/bookings");
          }, 3000);
        } else {
          setStatus("error");
          const errorMsg = res.ErrorMessage ?? res.error_message ?? "Payment verification failed.";
          setMessage(errorMsg);
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification. Please contact support if your balance was deducted.");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5 max-w-md w-full text-center border border-gray-100 animate-in zoom-in-95 duration-500">
        
        {status === "verifying" && (
          <div className="space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#60bb46] rounded-full border-t-transparent animate-spin"></div>
              <Loader2 className="absolute inset-0 m-auto text-[#60bb46] w-10 h-10 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Processing Payment</h1>
            <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-[#60bb46]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Successful!</h1>
            <p className="text-gray-600 font-medium leading-relaxed">{message}</p>
            <div className="pt-4">
              <p className="text-sm text-gray-400">Redirecting to your bookings in a moment...</p>
              <button 
                onClick={() => navigate("/bookings")}
                className="mt-6 w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-[0.98]"
              >
                Go to Bookings Now
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verification Failed</h1>
            <p className="text-gray-600 font-medium leading-relaxed">{message}</p>
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => navigate("/bookings")}
                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all active:scale-[0.98]"
              >
                Back to Bookings
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Retry Verification
              </button>
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-sm text-gray-400 font-medium">
        Secure Transaction • Powered by PitchPal & eSewa
      </p>
    </div>
  );
}
