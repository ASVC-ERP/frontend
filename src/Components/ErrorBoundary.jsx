import React from "react";

// Catches render/lifecycle errors in the subtree (including a lazy chunk
// that fails to load) and shows a recoverable screen instead of a blank
// page. Error boundaries must be class components.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught:", error, info?.componentStack);
    }
    // Prod: a Sentry/logging call would go here.
  }

  handleReload = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          color: "#1E5A84",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: ".5rem" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#6c757d", maxWidth: 420 }}>
          This screen hit an unexpected error. Reloading usually clears it.
        </p>
        {import.meta.env.DEV && (
          <pre
            style={{
              marginTop: "1rem",
              maxWidth: "90vw",
              overflow: "auto",
              textAlign: "left",
              background: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: 6,
              padding: "1rem",
              fontSize: 12,
              color: "#b00020",
            }}
          >
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        )}
        <button
          onClick={this.handleReload}
          style={{
            marginTop: "1.25rem",
            padding: "8px 20px",
            border: "none",
            borderRadius: 6,
            background: "#1E5A84",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
