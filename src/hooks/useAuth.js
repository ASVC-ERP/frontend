import { useSyncExternalStore } from "react";
import { subscribeAuth, getUser, logoutRequest } from "../api/http";

export const useAuth = () => {
  // Identity + role come from the in-memory access token (server-signed),
  // via the auth store in api/http.js. localStorage is not trusted here.
  const user = useSyncExternalStore(subscribeAuth, getUser, getUser);
  const isAuthenticated = user !== null;

  const handleLoginSuccess = () => {
    // The token is already in memory (LoginPage called setAccessToken), which
    // is what flips isAuthenticated. Persist a hint so a hard reload knows to
    // trade the refresh cookie for a new token before rendering.
    localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = async () => {
    await logoutRequest(); // revoke the refresh token server-side + clear local
  };

  return {
    isAuthenticated,
    user,
    handleLoginSuccess,
    handleLogout,
  };
};
