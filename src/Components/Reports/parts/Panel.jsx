export default function Panel({ title, action, empty, children }) {
  return (
    <div className="report-panel">
      <div
        className="report-panel-title"
        style={action ? { display: "flex", justifyContent: "space-between", alignItems: "baseline" } : undefined}
      >
        <span>{title}</span>
        {action}
      </div>
      {empty ? <div className="report-panel-empty">{empty}</div> : children}
    </div>
  );
}
