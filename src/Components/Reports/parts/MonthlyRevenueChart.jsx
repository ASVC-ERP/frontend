import { peso } from "../format";

const W = 640;
const H = 160;
const PAD_L = 8;
const PAD_R = 8;
const BASE_Y = 130;
const TOP_Y = 28; // extra headroom so the tallest bar's value label doesn't clip

const monthLabel = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short" });

// Full peso amounts don't fit above a 12-column bar -- abbreviate for the
// on-chart label; the exact figure is still in the hover tooltip.
const compactPeso = (n) => {
  const v = Number(n) || 0;
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `₱${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `₱${Math.round(v / 1_000)}K`;
  return `₱${Math.round(v)}`;
};

// data: [{ month: 'YYYY-MM-DD', total }], ascending by month. Last bar is highlighted.
export default function MonthlyRevenueChart({ data }) {
  if (!data?.length) {
    return <div className="report-panel-empty">No revenue in the last 12 months.</div>;
  }

  const max = Math.max(...data.map((d) => Number(d.total) || 0), 1);
  const n = data.length;
  const gap = 6;
  const barW = (W - PAD_L - PAD_R - gap * (n - 1)) / n;

  return (
    <div className="revenue-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly revenue, last 12 months">
        <line x1={PAD_L} y1={BASE_Y} x2={W - PAD_R} y2={BASE_Y} className="axis" />
        {data.map((d, i) => {
          const val = Number(d.total) || 0;
          const h = Math.max((val / max) * (BASE_Y - TOP_Y), val > 0 ? 2 : 0);
          const x = PAD_L + i * (barW + gap);
          const y = BASE_Y - h;
          const last = i === n - 1;
          return (
            <g key={d.month}>
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" className="bar-value">
                {compactPeso(val)}
              </text>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2}
                className={last ? "bar bar--last" : "bar"}
              >
                <title>{`${monthLabel(d.month)}: ${peso(val)}`}</title>
              </rect>
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" className="axis-label">
                {monthLabel(d.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
