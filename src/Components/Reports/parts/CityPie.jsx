import { peso } from "../format";

const COLORS = ["#1E5A84", "#2C7CB0", "#5AA9D6", "#93C7E6", "#C7E0F0", "#94a3b8"];
const SIZE = 230;
const R_OUT = 108;
const R_IN = 62;

const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

const slicePath = (start, end) => {
  const c = SIZE / 2;
  const [x1, y1] = polar(c, c, R_OUT, start);
  const [x2, y2] = polar(c, c, R_OUT, end);
  const [x3, y3] = polar(c, c, R_IN, end);
  const [x4, y4] = polar(c, c, R_IN, start);
  const large = end - start > 180 ? 1 : 0;
  return `M${x1},${y1} A${R_OUT},${R_OUT} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${R_IN},${R_IN} 0 ${large} 0 ${x4},${y4} Z`;
};

// data: [{ city, total }] (sorted desc). Keeps top 5, rolls the rest into "Others".
// layout "column" (default) stacks pie above legend; "row" puts them side by side.
export default function CityPie({ data, layout = "column" }) {
  const total = data.reduce((s, d) => s + Number(d.total || 0), 0);
  if (!data.length || total <= 0) {
    return <div className="report-panel-empty">No sales in this range.</div>;
  }

  const top = data.slice(0, 5);
  const restSum = data.slice(5).reduce((s, d) => s + Number(d.total || 0), 0);
  const segs = restSum > 0 ? [...top, { city: "Others", total: restSum }] : top;

  let acc = 0;
  const arcs = segs.map((s, i) => {
    const frac = Number(s.total) / total;
    const start = acc * 360;
    acc += frac;
    const end = acc * 360;
    return { ...s, i, start, end, frac };
  });

  const c = SIZE / 2;
  const single = arcs.length === 1;

  return (
    <div className={`report-pie-wrap${layout === "row" ? " report-pie-wrap--row" : ""}`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Sales by city">
        {single ? (
          <circle cx={c} cy={c} r={(R_OUT + R_IN) / 2} fill="none" stroke={COLORS[0]} strokeWidth={R_OUT - R_IN} />
        ) : (
          arcs.map((a) => (
            <path key={a.i} d={slicePath(a.start, a.end)} fill={COLORS[a.i % COLORS.length]} />
          ))
        )}
      </svg>

      <ul
        className={`report-pie-legend${layout === "row" ? " report-pie-legend--bars" : ""}`}
        style={{ margin: 0, padding: 0 }}
      >
        {arcs.map((a) => (
          <li key={a.i}>
            <span className="label">
              <span className="dot" style={{ background: COLORS[a.i % COLORS.length] }} />
              {a.city}
            </span>
            {layout === "row" && (
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{
                    width: `${Math.max(Math.round(a.frac * 100), 2)}%`,
                    background: COLORS[a.i % COLORS.length],
                  }}
                />
              </span>
            )}
            <span className="val">
              {Math.round(a.frac * 100)}% · {peso(a.total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
