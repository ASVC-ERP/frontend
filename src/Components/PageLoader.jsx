// Suspense fallback while a route's code chunk loads.
export default function PageLoader() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="spinner-border"
        style={{ color: "#1E5A84", width: "2.5rem", height: "2.5rem" }}
      />
      <div style={{ marginTop: 12, color: "#6c757d", fontWeight: 600 }}>
        Loading…
      </div>
    </div>
  );
}
