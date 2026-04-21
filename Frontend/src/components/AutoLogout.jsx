import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isSessionExpired, clearSession, isLoggedIn } from "../api/auth";

export default function AutoLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    // This background timer runs every 30 seconds.
    // It automatically checks if the user's session has expired, and if it has, 
    // it logs them out immediately to keep the app secure.
    const interval = setInterval(() => {
      if (isLoggedIn() && isSessionExpired()) {
        clearInterval(interval);
        clearSession();
        alert("Your session has expired. Please log in again.");
        navigate("/login");
      }
    }, 30000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  return null;
}
