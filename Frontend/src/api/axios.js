import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// We use a "Request Interceptor" to automatically add our secret Token to every API call.
// This way, we don't have to manually add it every time we fetch data from the backend.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We use a "Response Interceptor" to handle common errors like 401 Unauthorized.
// If the backend says our token is no longer valid, we automatically log the user out and send them to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear session and redirect to login on 401 Unauthorized
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
      localStorage.removeItem("login_time");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
