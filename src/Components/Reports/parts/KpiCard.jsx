// delta (optional): { cur, prev, goodDirection?: "up"|"down", mode?: "pct"|"points" }
//   - shows a small "▲ 12.3% vs prev" line under the value
//   - colour is by whether the move is good (green) or bad (red), per goodDirection
//   - mode "points" shows a percentage-point difference (for rate metrics like margin)
function DeltaLine({ delta }) {
  if (!delta || delta.prev == null) return null;

  const cur = Number(delta.cur) || 0;
  const prev = Number(delta.prev) || 0;
  const good = delta.goodDirection || "up";
  const diff = cur - prev;
  const dir = diff > 0.00001 ? "up" : diff < -0.00001 ? "down" : "flat";

  let text;
  if (dir === "flat") {
    text = "no change vs prev";
  } else if (delta.mode === "points") {
    text = `${Math.abs(diff).toFixed(1)} pts vs prev`;
  } else if (prev === 0) {
    text = "new vs prev";
  } else {
    text = `${Math.abs((diff / prev) * 100).toFixed(1)}% vs prev`;
  }

  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "—";
  const color =
    dir === "flat"
      ? "#94a3b8"
      : dir === good
        ? "#16a34a"
        : "#dc2626";

  return (
    <div className="kpi-sub" style={{ color, fontWeight: 600 }}>
      {arrow} {text}
    </div>
  );
}

export default function KpiCard({ label, value, sub, delta, wide }) {
  if (wide) {
    return (
      <div className="kpi-card kpi-card--wide">
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
          {sub != null && <div className="kpi-sub">{sub}</div>}
        </div>
        <DeltaLine delta={delta} />
      </div>
    );
  }
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <DeltaLine delta={delta} />
      {sub != null && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
