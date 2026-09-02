import { useState } from "react";

const readUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  // Authenticated only when the flag, the token, and a parseable user all agree.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () =>
      localStorage.getItem("isAuthenticated") === "true" &&
      !!localStorage.getItem("access_token") &&
      readUser() !== null,
  );

  const user = readUser();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  };

  return {
    isAuthenticated,
    user,
    handleLoginSuccess,
    handleLogout,
  };
};
