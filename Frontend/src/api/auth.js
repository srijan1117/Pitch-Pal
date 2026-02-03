import api from "./axios";

export async function loginUser(payload) {
  const res = await api.post("/accounts/login/", payload);

  // Your backend returns tokens inside Result.data
  const data = res.data?.Result?.data;

  if (!data?.access_token) {
    throw new Error("No access token returned");
  }

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  return data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}
