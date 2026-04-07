import api from "./axios";

export async function loginUser(payload) {
  const res = await api.post("/accounts/login/", payload);

  const data = res.data?.Result?.data;

  if (!data?.access_token) {
    throw new Error("No access token returned");
  }

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("login_time", Date.now().toString());

  if (data.email) localStorage.setItem("email", data.email);
  if (data.phone_number) localStorage.setItem("phone", data.phone_number);
  if (data.role) localStorage.setItem("role", data.role);

  return data;
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
  localStorage.removeItem("login_time");
  localStorage.removeItem("email");
  localStorage.removeItem("phone");
}

export function isSessionExpired() {
  const loginTime = localStorage.getItem("login_time");
  if (!loginTime) return false;
  const twoHours = 2 * 60 * 60 * 1000;
  return Date.now() - parseInt(loginTime, 10) > twoHours;
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

export async function updatePassword(payload) {
  const res = await api.put("/accounts/update_password/", payload);
  return res.data;
}