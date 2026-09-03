import { useState } from "react";
import { logoutRequest } from "../api/http";

const readUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  // The access token now lives in memory (see api/http.js) and is restored from
  // the refresh cookie at startup, so the gate keys off the flag + a parseable user.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () =>
      localStorage.getItem("isAuthenticated") === "true" && readUser() !== null,
  );

  const user = readUser();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = async () => {
    await logoutRequest(); // revoke the refresh token server-side + clear local
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    user,
    handleLoginSuccess,
    handleLogout,
  };
};
