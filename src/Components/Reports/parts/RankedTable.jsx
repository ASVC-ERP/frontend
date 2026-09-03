import { peso } from "../format";

// rows: [{ key, label, value }]
export default function RankedTable({ labelHeader = "Name", valueHeader = "Total", rows }) {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th className="rank">#</th>
          <th>{labelHeader}</th>
          <th style={{ textAlign: "right" }}>{valueHeader}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.key ?? i}>
            <td className="rank">{i + 1}</td>
            <td>{r.label || "—"}</td>
            <td className="num">{peso(r.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
