import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone_number: "",
    address: "",
    role: "user",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/accounts/register/", formData);
      navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.error_message?.phone_number ||
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Error creating account"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reusable Eye Icon Component
  const EyeIcon = ({ show }) => (
    show ? (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  );

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* LEFT SIDE: Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-green-900 items-center justify-center p-12 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-50 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000')" }}
        ></div>
        <div className="relative z-10 max-w-md text-white text-center">
          <h2 className="text-5xl font-bold leading-tight">Join our community</h2>
          <p className="mt-6 text-lg opacity-90 leading-relaxed">
            Create an account to start booking your favorite pitches and connect with players.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500 mb-6 font-medium">Join us today! It only takes a minute.</p>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                name="email" type="email" value={formData.email} onChange={onChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input
                name="phone_number" type="tel" value={formData.phone_number} onChange={onChange}
                placeholder="98XXXXXXXX"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                required
              />
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Register as</label>
              <select
                name="role" value={formData.role} onChange={onChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 appearance-none"
              >
                <option value="user">User / Player</option>
                <option value="owner">Futsal Owner</option>
              </select>
            </div>

            {/* Address - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
              <input
                name="address" type="text" value={formData.address} onChange={onChange}
                placeholder="City, Street"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPass ? "text" : "password"} value={formData.password} onChange={onChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon show={showPass} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirm_password" type={showConfirmPass ? "text" : "password"} value={formData.confirm_password} onChange={onChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon show={showConfirmPass} />
                </button>
              </div>
            </div>

            {/* Submit & Redirect */}
            <div className="md:col-span-2 pt-2">
              <button
                type="submit" disabled={loading}
                className="w-full rounded-xl bg-gray-600 py-3.5 font-bold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-gray-100"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
              
              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-blue-600 hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}