import { useState } from "react";
import ReportToolbar from "./ReportToolbar";
import { useReportData } from "./useReportData";
import { exportReport } from "./exportReport";
import { presetRange } from "./dateRange";
import { peso } from "./format";
import { showErrorSwal } from "../../utils/swal";
import KpiCard from "./parts/KpiCard";
import Panel from "./parts/Panel";
import RankedTable from "./parts/RankedTable";
import ViewFullLink from "./parts/ViewFullLink";
import AiInsightsPanel from "./parts/AiInsightsPanel";
import "../../styles/page.css";
import "../../styles/buttons.css";
import "./reports.css";

export default function PurchaseReport() {
  const [range, setRange] = useState(() => {
    const [from, to] = presetRange("this-month");
    return { from, to };
  });
  const { data, loading, error } = useReportData("purchases", range);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReport("purchases", range);
    } catch (e) {
      showErrorSwal("Export failed", e.response?.data?.message || "Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Purchase Report Analysis</div>
          <p className="page-subtitle">Analyze your purchasing activity and trends.</p>
        </div>
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
          <AiInsightsPanel reportPath="purchases" range={range} />

          <div className="report-kpis">
            <KpiCard
              label="Total Purchases"
              value={peso(data.kpis.total_purchases)}
              wide
              delta={{
                cur: data.kpis.total_purchases,
                prev: data.kpis_prev?.total_purchases,
              }}
            />
          </div>

          <div className="report-row-2">
            <Panel
              title="Top Purchased Products"
              action={<ViewFullLink report="purchases" panel="top_products" range={range} />}
              empty={!data.top_products.length && "No purchases in this range."}
            >
              <RankedTable
                labelHeader="Product"
                valueHeader="Total Purchases"
                rows={data.top_products.map((r) => ({
                  key: r.product_id,
                  label: r.description,
                  value: r.total,
                }))}
              />
            </Panel>

            <Panel
              title="Top Suppliers"
              action={
                <ViewFullLink to={`/reports/suppliers?from=${range.from}&to=${range.to}`} />
              }
              empty={!data.top_suppliers.length && "No purchases in this range."}
            >
              <RankedTable
                labelHeader="Supplier"
                valueHeader="Purchases"
                rows={data.top_suppliers.map((r) => ({
                  key: r.supplier_id,
                  label: r.name,
                  value: r.total,
                }))}
              />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
