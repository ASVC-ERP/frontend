import { useState } from "react";
import ReportToolbar from "./ReportToolbar";
import { useReportData } from "./useReportData";
import { presetRange } from "./dateRange";
import "../../styles/page.css";
import "../../styles/buttons.css";

export default function SalesReport() {
  const [range, setRange] = useState(() => {
    const [from, to] = presetRange("this-month");
    return { from, to };
  });
  const { data, loading, error } = useReportData("sales", range);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Sales Report Analysis</div>
      </div>

      <ReportToolbar range={range} onApply={setRange} loading={loading} />

      {error && (
        <div className="page-card" style={{ color: "#c0392b" }}>
          {error}
        </div>
      )}

      {/* R4 replaces this dump with the KPI cards + panels */}
      {data && (
        <div className="page-card">
          <pre style={{ margin: 0, fontSize: 12, overflowX: "auto" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
