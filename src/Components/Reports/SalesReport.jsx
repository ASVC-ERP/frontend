import { useState } from "react";
import ReportToolbar from "./ReportToolbar";
import { useReportData } from "./useReportData";
import { presetRange } from "./dateRange";
import { peso, pct } from "./format";
import KpiCard from "./parts/KpiCard";
import Panel from "./parts/Panel";
import RankedTable from "./parts/RankedTable";
import BrandPnlTable from "./parts/BrandPnlTable";
import CityPie from "./parts/CityPie";
import SlowMovingCards from "./parts/SlowMovingCards";
import "../../styles/page.css";
import "../../styles/buttons.css";
import "./reports.css";

export default function SalesReport() {
  const [range, setRange] = useState(() => {
    const [from, to] = presetRange("this-month");
    return { from, to };
  });
  const { data, loading, error } = useReportData("sales", range);

  const k = data?.kpis;

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

      {!error && (!data || loading) && (
        <div className="page-card" style={{ color: "#64748b" }}>Loading report…</div>
      )}

      {!error && data && !loading && (
        <>
          <div className="report-kpis">
            <KpiCard label="Total Revenue" value={peso(k.revenue)} accent="#1E5A84" />
            <KpiCard label="COGS" value={peso(k.cogs)} accent="#dc2626" valueColor="#dc2626" />
            <KpiCard label="Gross Profit" value={peso(k.gross_profit)} accent="#16a34a" valueColor="#16a34a" />
            <KpiCard label="Gross Margin" value={pct(k.margin_pct)} accent="#d97706" />
          </div>

          <div className="report-row-3">
            <Panel title="Best-Selling Products" empty={!data.best_selling.length && "No sales in this range."}>
              <RankedTable
                labelHeader="Product"
                valueHeader="Total Sales"
                rows={data.best_selling.map((r) => ({
                  key: r.product_id,
                  label: r.description,
                  value: r.total,
                }))}
              />
            </Panel>

            <Panel title="Top Customers" empty={!data.top_customers.length && "No sales in this range."}>
              <RankedTable
                labelHeader="Customer"
                valueHeader="Sales"
                rows={data.top_customers.map((r) => ({
                  key: r.customer_id,
                  label: r.name,
                  value: r.total,
                }))}
              />
            </Panel>

            <Panel title="Sales By City">
              <CityPie data={data.sales_by_city} />
            </Panel>
          </div>

          <div className="report-row-2">
            <Panel title="P&L Summary by Brand" empty={!data.pnl_by_brand.length && "No sales in this range."}>
              <BrandPnlTable rows={data.pnl_by_brand} />
            </Panel>

            <Panel title="Slow-Moving Products">
              <SlowMovingCards items={data.slow_moving} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
