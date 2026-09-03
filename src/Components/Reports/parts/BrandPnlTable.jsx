import { peso, pct } from "../format";

// rows: [{ brand, revenue, profit, margin_pct }]
export default function BrandPnlTable({ rows }) {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Brand</th>
          <th style={{ textAlign: "right" }}>Revenue</th>
          <th style={{ textAlign: "right" }}>Margin</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.brand ?? i}>
            <td>{r.brand}</td>
            <td className="num">{peso(r.revenue)}</td>
            <td className={"num " + (Number(r.margin_pct) < 10 ? "margin-low" : "margin-pos")}>
              {pct(r.margin_pct)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
