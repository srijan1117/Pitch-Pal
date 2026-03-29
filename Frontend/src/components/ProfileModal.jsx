import { X, Camera, Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, updatePassword } from "../api/auth";
import LogoutConfirmationModal from "./LogoutConfirmationModal";

export function ProfileModal({ close }) {
  const [form, setForm] = useState({
    firstName: "Srijan",
    lastName: "Shrestha",
    phone: "+977 9812345678",
    email: "srijan@example.com",
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    close();
    navigate("/login");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving profile data:", form);
    alert("Profile updated successfully!");
    close();
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_new_password) {
      setPasswordError("All fields are required.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwordForm.new_password === passwordForm.current_password) {
      setPasswordError("New password cannot be the same as current password.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword(passwordForm);
      // Backend uses PascalCase keys: IsSuccess, ErrorMessage, Result
      const isSuccess = res.IsSuccess ?? res.is_success;
      
      if (isSuccess) {
        setPasswordSuccess("Password updated successfully!");
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_new_password: "",
        });
      } else {
        const errorMsg = res.ErrorMessage ?? res.error_message ?? res.detail ?? res.message;
        if (errorMsg) {
          if (typeof errorMsg === "object") {
            const firstError = Object.values(errorMsg)[0];
            setPasswordError(Array.isArray(firstError) ? firstError[0] : String(firstError));
          } else {
            setPasswordError(String(errorMsg));
          }
        } else {
          setPasswordError("Failed to update password. Please check your inputs.");
        }
      }
    } catch (err) {
      console.error("Password Update Error:", err);
      const errorData = err.response?.data;
      
      if (errorData) {
        // Try to find the most meaningful error message in both PascalCase and snake_case
        const errorMsg = errorData.ErrorMessage ?? errorData.error_message ?? errorData.detail ?? errorData.message;
        
        if (errorMsg) {
          if (typeof errorMsg === "object") {
            const firstError = Object.values(errorMsg)[0];
            setPasswordError(Array.isArray(firstError) ? firstError[0] : String(firstError));
          } else {
            setPasswordError(String(errorMsg));
          }
        } else {
          setPasswordError("Failed to update password: " + JSON.stringify(errorData).substring(0, 100));
        }
      } else if (err.message) {
        setPasswordError("Network Error: " + err.message);
      } else {
        setPasswordError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-14 z-50 w-auto sm:w-[520px] max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Edit Information</h2>

        <button onClick={close}>
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gray-200"></div>

          <button className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full">
            <Camera className="w-3 h-3" />
          </button>
        </div>

        <div>
          <p className="font-semibold">
            {form.firstName} {form.lastName}
          </p>
        </div>

        <button className="ml-auto px-3 py-2 border rounded-lg text-sm">
          Change Profile
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">

        <div>
          <label className="text-sm text-gray-500">First Name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Last Name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Phone Number</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Email Address</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

      </div>

      {/* Change Password Section */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          Change Password
        </h3>

        <div className="space-y-5">
          {/* Current Password */}
          <div className="relative">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="current_password"
                placeholder="••••••••"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-12 text-sm"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  placeholder="••••••••"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_new_password"
                  placeholder="••••••••"
                  value={passwordForm.confirm_new_password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {passwordError && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <button
            onClick={handleUpdatePassword}
            disabled={isUpdatingPassword}
            className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
          >
            {isUpdatingPassword ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 sm:gap-0">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors"
        >
          Logout
        </button>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={close}
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button 
            onClick={handleSave}
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}