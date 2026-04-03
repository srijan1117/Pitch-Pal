import { X, Camera, Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, updatePassword } from "../api/auth";
import LogoutConfirmationModal from "./LogoutConfirmationModal";
import api from "../api/axios";

export function ProfileModal({ close }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // ── Fetch real user data ──────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, userRes] = await Promise.all([
          api.get("/accounts/user/profile/"),
          api.get("/accounts/login/").catch(() => null),
        ]);
        const profileData = profileRes.data?.Result || {};
        const email = localStorage.getItem("email") || "";
        const role = localStorage.getItem("role") || "";
        const phone = localStorage.getItem("phone") || "";
        setProfile({ ...profileData, email, role, phone });
      } catch {
        const email = localStorage.getItem("email") || "";
        const role = localStorage.getItem("role") || "";
        setProfile({ email, role });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    clearSession();
    close();
    navigate("/login");
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
      const isSuccess = res.IsSuccess ?? res.is_success;
      if (isSuccess) {
        setPasswordSuccess("Password updated successfully!");
        setPasswordForm({ current_password: "", new_password: "", confirm_new_password: "" });
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
          setPasswordError("Failed to update password.");
        }
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMsg = errorData.ErrorMessage ?? errorData.error_message ?? errorData.detail;
        if (errorMsg) {
          if (typeof errorMsg === "object") {
            const firstError = Object.values(errorMsg)[0];
            setPasswordError(Array.isArray(firstError) ? firstError[0] : String(firstError));
          } else {
            setPasswordError(String(errorMsg));
          }
        } else {
          setPasswordError("Failed to update password.");
        }
      } else {
        setPasswordError("Network error. Please try again.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-14 z-50 w-auto sm:w-[520px] max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">My Profile</h2>
        <button onClick={close}><X className="w-5 h-5 text-gray-500" /></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      ) : (
        <>
          {/* Profile Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-700 font-bold text-2xl">
                  {profile?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.email}</p>
              <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Email Address</label>
              <input
                value={profile?.email || ""}
                readOnly
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Role</label>
              <input
                value={profile?.role || ""}
                readOnly
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50 text-gray-600 cursor-not-allowed capitalize"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Address</label>
              <input
                value={profile?.address_sync || ""}
                readOnly
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Member Since</label>
              <input
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
                readOnly
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50 text-gray-600 cursor-not-allowed"
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
                  <button type="button" onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <button type="button" onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

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
                    <button type="button" onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <button
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword}
                className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                ) : "Update Password"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 sm:gap-0">
            <button onClick={() => setIsLogoutModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors">
              Logout
            </button>
            <button onClick={close}
              className="w-full sm:w-auto px-5 py-2 rounded-lg border">
              Close
            </button>
          </div>
        </>
      )}

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}