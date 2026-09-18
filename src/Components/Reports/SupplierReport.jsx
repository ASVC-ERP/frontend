import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportToolbar from "./ReportToolbar";
import { useReportData } from "./useReportData";
import { exportReport } from "./exportReport";
import { presetRange } from "./dateRange";
import { peso } from "./format";
import { showErrorSwal } from "../../utils/swal";
import Panel from "./parts/Panel";
import "../../styles/page.css";
import "../../styles/buttons.css";
import "./reports.css";

function daysAgoLabel(dateStr, to) {
  if (!dateStr) return "Never";
  const days = Math.round(
    (new Date(`${to}T00:00:00`) - new Date(`${dateStr}T00:00:00`)) / 86400000
  );
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function SupplierReport() {
  const navigate = useNavigate();
  const [range, setRange] = useState(() => {
    const [from, to] = presetRange("this-month");
    return { from, to };
  });
  // The dashboard is also where Purchase Report's "View full" link for Top
  // Suppliers lands, so it shows a full ranking (up to 100), not a top-10 preview.
  const { data, loading, error } = useReportData("suppliers", range, { limit: 100 });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReport("suppliers", range, { limit: 100 });
    } catch (e) {
      showErrorSwal("Export failed", e.response?.data?.message || "Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const rows = data?.top_suppliers || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Supplier Report</div>
      </div>

      <ReportToolbar
        range={range}
        onApply={setRange}
        loading={loading}
        onExport={handleExport}
        exporting={exporting}
      />

      {error && (
        <div className="page-card" style={{ color: "#c0392b" }}>
          {error}
        </div>
      )}

      {!error && (!data || loading) && (
        <div className="page-card" style={{ color: "#64748b" }}>Loading report…</div>
      )}

      {!error && data && !loading && (
        <>
          <Panel
            title="Supplier Rankings"
            empty={!rows.length && "No purchases in this range."}
          >
            <table className="report-table">
              <thead>
                <tr>
                  <th className="rank">#</th>
                  <th>Supplier</th>
                  <th>Currency</th>
                  <th style={{ textAlign: "right" }}>Orders</th>
                  <th style={{ textAlign: "right" }}>Spend</th>
                  <th style={{ textAlign: "right" }}>Avg Order Value</th>
                  <th>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.supplier_id}
                    className="row-link"
                    onClick={() =>
                      navigate(
                        `/reports/suppliers/detail/${r.supplier_id}?from=${range.from}&to=${range.to}`
                      )
                    }
                  >
                    <td className="rank">{i + 1}</td>
                    <td>{r.name || "—"}</td>
                    <td>{r.currency || "—"}</td>
                    <td className="num">{r.total_orders}</td>
                    <td className="num">{peso(r.total)}</td>
                    <td className="num">{peso(r.avg_order_value)}</td>
                    <td>{daysAgoLabel(r.last_order_date, range.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}
    </div>
  );
}
