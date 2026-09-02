import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// The access token lives only in memory — it is short-lived (15 min) and is
// re-obtained from the refresh cookie on page load / on 401. It is never
// written to localStorage.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token || null;
}
export function getAccessToken() {
  return accessToken;
}

// Send the httpOnly refresh cookie with every request to our API.
axios.defaults.withCredentials = true;

function clearSessionLocal() {
  accessToken = null;
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
  localStorage.removeItem("access_token"); // legacy key cleanup
}

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

// ---- request: attach the in-memory access token ----------------------------
axios.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---- response: on 401, refresh once and retry -----------------------------
// Single-flight: parallel 401s share one refresh call.
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/authenticate/refresh`)
      .then((res) => {
        setAccessToken(res.data.access_token);
        return res.data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const url = config?.url || "";

    if (!response || response.status !== 401 || !config || config._retry) {
      return Promise.reject(error);
    }

    // A 401 from login = bad credentials. A 401 from refresh = the session is
    // really over. Neither should trigger another refresh.
    if (url.includes("/authenticate/login")) {
      return Promise.reject(error);
    }
    if (url.includes("/authenticate/refresh")) {
      clearSessionLocal();
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      const token = await refreshAccessToken();
      config._retry = true;
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      return axios(config);
    } catch {
      clearSessionLocal();
      redirectToLogin();
      return Promise.reject(error);
    }
  },
);

// ---- startup: trade the refresh cookie for an access token ----------------
// Uses fetch (not the intercepted axios) so a failure here doesn't recurse.
export async function bootstrapAuth() {
  if (localStorage.getItem("isAuthenticated") !== "true") return;
  try {
    const res = await fetch(`${API_URL}/authenticate/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("refresh failed");
    const data = await res.json();
    setAccessToken(data.access_token);
  } catch {
    clearSessionLocal();
  }
}

// ---- logout: revoke server-side, then clear local ------------------------
export async function logoutRequest() {
  try {
    await fetch(`${API_URL}/authenticate/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // best effort — clear locally regardless
  }
  clearSessionLocal();
}

export default axios;
