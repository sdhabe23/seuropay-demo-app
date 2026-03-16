import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/tailwind.css";

// ── Tink callback handler ─────────────────────────────────────────────────────
// Tink redirects to http://localhost:5173?code=XXX (AIS) or
// http://localhost:5173?payment_request_id=XXX (PIS).
// The hash router hasn't started yet, so we must handle these here.
(async () => {
  const sp = new URLSearchParams(window.location.search);

  if (sp.has("payment_request_id")) {
    // PIS callback — forward to hash route
    window.location.replace(`/#/payment-result${window.location.search}`);
    return;
  }

  if (sp.has("code")) {
    // AIS callback — forward to backend which will exchange the code and
    // then redirect the browser back to /#/link-bank?tink_success=1
    const session = localStorage.getItem("seuropay_session_id") || "";
    const code = sp.get("code")!;
    const qs = new URLSearchParams({ code, state: session }).toString();
    window.location.replace(`http://localhost:4000/api/tink/callback?${qs}`);
    return;
  }
})();
// ─────────────────────────────────────────────────────────────────────────────

const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element not found. Expected <div id="root"></div> in index.html');
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
