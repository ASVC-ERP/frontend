import { useState } from "react";
import { presetRange, RANGE_PRESETS } from "./dateRange";

// Range picker shared by the Sales and Purchase report pages.
// Calls onApply({ from, to }) on preset change and on the Apply button.
export default function ReportToolbar({ range, onApply, loading }) {
  const [preset, setPreset] = useState("this-month");
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);

  const changePreset = (p) => {
    setPreset(p);
    const r = presetRange(p);
    if (r) {
      setFrom(r[0]);
      setTo(r[1]);
      onApply({ from: r[0], to: r[1] });
    }
  };

  const dirty = from !== range.from || to !== range.to;

  return (
    <div className="page-toolbar">
      <div className="search-group" style={{ gap: 12, flexWrap: "wrap" }}>
        <select
          className="form-select"
          style={{ maxWidth: 190 }}
          value={preset}
          onChange={(e) => changePreset(e.target.value)}
        >
          {RANGE_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="form-control"
          style={{ maxWidth: 170 }}
          value={from}
          max={to}
          onChange={(e) => {
            setFrom(e.target.value);
            setPreset("custom");
          }}
        />
        <span style={{ color: "#64748b", alignSelf: "center" }}>—</span>
        <input
          type="date"
          className="form-control"
          style={{ maxWidth: 170 }}
          value={to}
          min={from}
          onChange={(e) => {
            setTo(e.target.value);
            setPreset("custom");
          }}
        />

        <button
          className="btn-primary-custom"
          disabled={loading || !from || !to}
          onClick={() => onApply({ from, to })}
        >
          {loading ? "Loading..." : dirty ? "Apply" : "Refresh"}
        </button>
      </div>
    </div>
  );
}
