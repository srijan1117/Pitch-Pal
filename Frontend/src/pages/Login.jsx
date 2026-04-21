import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, clearSession, isSessionExpired } from "../api/auth";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // This effect runs when the page loads. If the user is already logged in, 
  // we automatically send them to their dashboard so they don't have to log in again.
  useEffect(() => {
    if (!isSessionExpired() && localStorage.getItem("access_token")) {
      const role = localStorage.getItem("role");
      if (role === "admin" || role === "superuser") {
        window.location.href = "http://localhost:8000/admin/";
      } else if (role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/home");
      }
    } else {
      clearSession();
    }
  }, [navigate]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form);
      if (data?.role === "admin" || data?.role === "superuser") {
        window.location.href = "http://localhost:8000/admin/";
      } else if (data?.role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.ErrorMessage?.message || 
                           err?.response?.data?.detail || 
                           "Invalid credentials";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">

      <div className="hidden lg:flex lg:w-1/2 relative bg-green-900 items-center justify-center p-12 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-50 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000')" }}
        ></div>
        <div className="relative z-10 max-w-md text-white">
          <h2 className="text-5xl font-bold leading-tight uppercase tracking-tighter">Own the Pitch, <br /> Book Your Game.</h2>
          <p className="mt-6 text-xl opacity-90 leading-relaxed font-medium">
            The ultimate platform for futsal enthusiasts in Nepal. Quick bookings, verified courts, and a community of players waiting for you.
          </p>
        </div>
      </div>


      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-start mb-8">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center p-2 mb-4 shadow-sm">
              <img src={logo} alt="PitchPal Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-500 font-medium">Please enter your details to sign in to PitchPal.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                Remember me
              </label>
              <Link to="/forgot-password" size="sm" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#7c7c7c] py-3.5 font-bold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-60 shadow-md"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => window.location.href = "http://localhost:8000/admin/"}
              className="w-full rounded-xl border-2 border-green-600 bg-transparent py-3 font-bold text-green-600 transition-all hover:bg-green-50 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Admin Dashboard
            </button>


            <div className="pt-4 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-blue-600 hover:underline underline-offset-4">
                  Create free account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}