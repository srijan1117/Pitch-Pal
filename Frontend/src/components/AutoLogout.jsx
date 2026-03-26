import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isSessionExpired, clearSession } from "../api/auth";

export default function AutoLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSessionExpired()) {
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
