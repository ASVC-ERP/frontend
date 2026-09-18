import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportToolbar from "./ReportToolbar";
import { useReportData } from "./useReportData";
import { exportReport } from "./exportReport";
import { presetRange } from "./dateRange";
import { peso, pct } from "./format";
import { segmentFor, SEGMENT_LABEL } from "./segment";
import { showErrorSwal } from "../../utils/swal";
import KpiCard from "./parts/KpiCard";
import Panel from "./parts/Panel";
import CityPie from "./parts/CityPie";
import ViewFullLink from "./parts/ViewFullLink";
import SegmentLegend from "./parts/SegmentLegend";
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

export default function CustomerReport() {
  const navigate = useNavigate();
  const [range, setRange] = useState(() => {
    const [from, to] = presetRange("this-month");
    return { from, to };
  });
  // The dashboard is also where Sales Report's "View full" link for Top
  // Customers lands, so it shows a full ranking (up to 100), not a top-10 preview.
  const { data, loading, error } = useReportData("customers", range, { limit: 100 });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReport("customers", range, { limit: 100 });
    } catch (e) {
      showErrorSwal("Export failed", e.response?.data?.message || "Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // const k = data?.kpis;
  // const kp = data?.kpis_prev;
  const rows = data?.top_customers || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Customer Report</div>
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
          {/* <div className="report-kpis">
            <KpiCard
              label="Active Customers"
              value={k.active_customers}
              delta={{ cur: k.active_customers, prev: kp?.active_customers }}
            />
            <KpiCard
              label="Total Revenue"
              value={peso(k.revenue)}
              delta={{ cur: k.revenue, prev: kp?.revenue }}
            />
            <KpiCard
              label="Avg Order Value"
              value={peso(k.avg_order_value)}
              delta={{ cur: k.avg_order_value, prev: kp?.avg_order_value }}
            />
            <KpiCard
              label="New vs Returning"
              value={`${k.new_customers} / ${k.returning_customers}`}
              sub="customers this period"
            />
          </div> */}

          <div className="report-stack">
            <Panel
              title="Revenue by City"
              action={<ViewFullLink report="customers" panel="customers_by_city" range={range} />}
            >
              <CityPie data={data.customers_by_city} layout="row" />
            </Panel>

            <Panel
              title="Customer Rankings"
              empty={!rows.length && "No sales in this range."}
            >
              <table className="report-table">
                <thead>
                  <tr>
                    <th className="rank">#</th>
                    <th>Customer</th>
                    <th>City</th>
                    <th>
                      Segment
                      <SegmentLegend />
                    </th>
                    <th style={{ textAlign: "right" }}>Orders</th>
                    <th style={{ textAlign: "right" }}>Revenue</th>
                    <th style={{ textAlign: "right" }}>Margin</th>
                    <th>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const seg = segmentFor(r, { to: range.to, rankIndex: i });
                    return (
                      <tr
                        key={r.customer_id}
                        className="row-link"
                        onClick={() =>
                          navigate(
                            `/reports/customers/detail/${r.customer_id}?from=${range.from}&to=${range.to}`
                          )
                        }
                      >
                        <td className="rank">{i + 1}</td>
                        <td>{r.name || "—"}</td>
                        <td>{r.city || "—"}</td>
                        <td>
                          <span className={`seg-badge seg-${seg}`}>{SEGMENT_LABEL[seg]}</span>
                        </td>
                        <td className="num">{r.total_orders}</td>
                        <td className="num">{peso(r.total)}</td>
                        <td className={`num ${Number(r.margin_pct) >= 25 ? "margin-pos" : ""}`}>
                          {pct(r.margin_pct)}
                        </td>
                        <td>{daysAgoLabel(r.last_order_date, range.to)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
