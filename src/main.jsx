import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { bootstrapAuth } from "./api/http.js"; // registers axios interceptors + trades the refresh cookie for an access token

// Get an access token from the refresh cookie before the app renders, so
// protected screens don't flash a 401 on a hard reload.
bootstrapAuth().finally(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
