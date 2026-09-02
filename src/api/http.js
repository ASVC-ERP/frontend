import axios from "axios";

// The whole app imports the default `axios` singleton, so registering the
// interceptors here (once, at startup) covers every existing call site.

// Attach the bearer token to every outgoing request.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (missing / expired token), drop the session and return to /login.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default axios;
