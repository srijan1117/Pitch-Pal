import { X, Camera } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../api/auth";
import LogoutConfirmationModal from "./LogoutConfirmationModal";

export function ProfileModal({ close }) {
  const [form, setForm] = useState({
    firstName: "Srijan",
    lastName: "Shrestha",
    phone: "+977 9812345678",
    email: "srijan@example.com",
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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