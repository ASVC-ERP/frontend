import { useState } from "react";
import ReportToolbar from "./ReportToolbar";
import { useReportData } from "./useReportData";
import { exportReport } from "./exportReport";
import { presetRange } from "./dateRange";
import { peso, pct } from "./format";
import { showErrorSwal } from "../../utils/swal";
import KpiCard from "./parts/KpiCard";
import Panel from "./parts/Panel";
import RankedTable from "./parts/RankedTable";
import BrandPnlTable from "./parts/BrandPnlTable";
import CityPie from "./parts/CityPie";
import SlowMovingCards from "./parts/SlowMovingCards";
import ViewFullLink from "./parts/ViewFullLink";
import "../../styles/page.css";
import "../../styles/buttons.css";
import "./reports.css";

export default function SalesReport() {
  const [range, setRange] = useState(() => {
    const [from, to] = presetRange("this-month");
    return { from, to };
  });
  const { data, loading, error } = useReportData("sales", range);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReport("sales", range);
    } catch (e) {
      showErrorSwal("Export failed", e.response?.data?.message || "Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const k = data?.kpis;
  const kp = data?.kpis_prev;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Sales Report Analysis</div>
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
          <div className="report-kpis">
            <KpiCard
              label="Total Revenue"
              value={peso(k.revenue)}
              accent="#1E5A84"
              delta={{ cur: k.revenue, prev: kp?.revenue }}
            />
            <KpiCard
              label="COGS"
              value={peso(k.cogs)}
              accent="#dc2626"
              valueColor="#dc2626"
              delta={{ cur: k.cogs, prev: kp?.cogs, goodDirection: "down" }}
            />
            <KpiCard
              label="Gross Profit"
              value={peso(k.gross_profit)}
              accent="#16a34a"
              valueColor="#16a34a"
              delta={{ cur: k.gross_profit, prev: kp?.gross_profit }}
            />
            <KpiCard
              label="Gross Margin"
              value={pct(k.margin_pct)}
              accent="#d97706"
              delta={{ cur: k.margin_pct, prev: kp?.margin_pct, mode: "points" }}
            />
          </div>

          <div className="report-row-3">
            <Panel
              title="Best-Selling Products"
              action={<ViewFullLink report="sales" panel="best_selling" range={range} />}
              empty={!data.best_selling.length && "No sales in this range."}
            >
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

            <Panel
              title="Top Customers"
              action={<ViewFullLink report="sales" panel="top_customers" range={range} />}
              empty={!data.top_customers.length && "No sales in this range."}
            >
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

            <Panel
              title="Sales By City"
              action={<ViewFullLink report="sales" panel="sales_by_city" range={range} />}
            >
              <CityPie data={data.sales_by_city} />
            </Panel>
          </div>

          <div className="report-row-2">
            <Panel
              title="P&L Summary by Brand"
              action={<ViewFullLink report="sales" panel="pnl_by_brand" range={range} />}
              empty={!data.pnl_by_brand.length && "No sales in this range."}
            >
              <BrandPnlTable rows={data.pnl_by_brand} />
            </Panel>

            <Panel
              title="Slow-Moving Products"
              action={<ViewFullLink report="sales" panel="slow_moving" range={range} />}
            >
              <SlowMovingCards items={data.slow_moving} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
