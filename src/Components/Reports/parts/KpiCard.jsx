export default function KpiCard({ label, value, accent, valueColor, sub }) {
  return (
    <div className="kpi-card" style={accent ? { borderTopColor: accent } : undefined}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      {sub != null && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
