import { X, Camera } from "lucide-react";
import { useState } from "react";

export function ProfileModal({ close }) {
  const [form, setForm] = useState({
    firstName: "Srijan",
    lastName: "Shrestha",
    phone: "+977 9812345678",
    email: "srijan@example.com",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving profile data:", form);
    alert("Profile updated successfully!");
    close();
  };

  return (
    <div className="absolute right-0 top-14 z-50 w-[520px] bg-white rounded-2xl shadow-2xl p-6">

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
      <div className="grid grid-cols-2 gap-4">

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
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={close}
          className="px-5 py-2 rounded-lg border"
        >
          Cancel
        </button>

        <button 
          onClick={handleSave}
          className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
        >
          Save
        </button>
      </div>

    </div>
  );
}