import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// The access token lives only in memory — it is short-lived (15 min) and is
// re-obtained from the refresh cookie on page load / on 401. It is never
// written to localStorage.
let accessToken = null;

// ---- auth store: the token IS the source of truth for identity/role -------
// Role gating (routes, menus) reads getUser() below, which decodes the
// server-signed access token. localStorage is never trusted for role — a
// user editing it in DevTools changes nothing.
const authListeners = new Set();
let cachedToken = null;
let cachedUser = null;

export function subscribeAuth(listener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}
function notifyAuth() {
  for (const l of authListeners) l();
}

function decodeJwt(token) {
  try {
    const part = token.split(".")[1];
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      part.length + ((4 - (part.length % 4)) % 4),
      "=",
    );
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

// The signed-in user, derived from the in-memory access token. Returns a
// stable reference while the token is unchanged (safe for useSyncExternalStore).
export function getUser() {
  if (!accessToken) {
    cachedToken = null;
    cachedUser = null;
    return null;
  }
  if (accessToken !== cachedToken) {
    cachedToken = accessToken;
    const p = decodeJwt(accessToken);
    cachedUser = p
      ? { userId: p.sub, username: p.username, name: p.name, role: p.role }
      : null;
  }
  return cachedUser;
}

export function setAccessToken(token) {
  accessToken = token || null;
  notifyAuth();
}
export function getAccessToken() {
  return accessToken;
}

// Send the httpOnly refresh cookie with every request to our API.
axios.defaults.withCredentials = true;

function clearSessionLocal() {
  setAccessToken(null); // clears the in-memory token + notifies the auth store
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user"); // legacy key cleanup (no longer written)
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
