import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import ReportToolbar from "./ReportToolbar";
import { presetRange } from "./dateRange";
import { peso } from "./format";
import { exportDetailList } from "./exportReport";
import { showErrorSwal } from "../../utils/swal";
import "../../styles/page.css";
import "../../styles/buttons.css";
import "./reports.css";

const API_URL = import.meta.env.VITE_API_URL;
const money = (r, k = "total") => ({
  name: k === "total" ? "Total" : k,
  selector: (row) => Number(row[k]) || 0,
  format: (row) => peso(row[k]),
  sortable: true,
  right: true,
});

// One config per "View full" panel: title, where "back" goes, and the
// react-data-table columns. Panel names match DETAIL_PANELS on the server.
const PANELS = {
  best_selling: {
    report: "Sales",
    back: "/reports/sales",
    title: "Best-Selling Products",
    columns: [
      { name: "Product", selector: (r) => r.description || "—", sortable: true, grow: 2, wrap: true },
      { ...money(null, "total"), name: "Total Sales" },
    ],
  },
  top_customers: {
    report: "Sales",
    back: "/reports/sales",
    title: "Top Customers",
    columns: [
      { name: "Customer", selector: (r) => r.name || "—", sortable: true, grow: 2, wrap: true },
      { ...money(null, "total"), name: "Sales" },
    ],
  },
  slow_moving: {
    report: "Sales",
    back: "/reports/sales",
    title: "Slow-Moving Products",
    columns: [
      {
        name: "Product",
        selector: (r) => r.description || `Product ${r.product_id}`,
        sortable: true,
        grow: 2,
        wrap: true,
      },
      { name: "Last Sold", selector: (r) => r.last_sold || "Never", sortable: true },
      {
        name: "Days Ago",
        selector: (r) => (r.days_ago == null ? Number.MAX_SAFE_INTEGER : r.days_ago),
        format: (r) => (r.days_ago == null ? "never sold" : r.days_ago),
        sortable: true,
        right: true,
      },
    ],
  },
  sales_by_city: {
    report: "Sales",
    back: "/reports/sales",
    title: "Sales by City",
    columns: [
      { name: "City", selector: (r) => r.city || "—", sortable: true, grow: 2, wrap: true },
      { ...money(null, "total"), name: "Sales" },
    ],
  },
  pnl_by_brand: {
    report: "Sales",
    back: "/reports/sales",
    title: "P&L Summary by Brand",
    columns: [
      { name: "Brand", selector: (r) => r.brand || "—", sortable: true, grow: 2, wrap: true },
      { ...money(null, "revenue"), name: "Revenue" },
      { ...money(null, "profit"), name: "Profit" },
      {
        name: "Margin %",
        selector: (r) => Number(r.margin_pct) || 0,
        format: (r) => `${Number(r.margin_pct) || 0}%`,
        sortable: true,
        right: true,
      },
    ],
  },
  top_products: {
    report: "Purchase",
    back: "/reports/purchases",
    title: "Top Purchased Products",
    columns: [
      { name: "Product", selector: (r) => r.description || "—", sortable: true, grow: 2, wrap: true },
      { ...money(null, "total"), name: "Total" },
    ],
  },
  top_suppliers: {
    report: "Purchase",
    back: "/reports/purchases",
    title: "Top Suppliers",
    columns: [
      { name: "Supplier", selector: (r) => r.name || "—", sortable: true, grow: 2, wrap: true },
      { ...money(null, "total"), name: "Total" },
    ],
  },
};

export default function ReportListPage() {
  const { panel } = useParams();
  const [sp, setSp] = useSearchParams();
  const cfg = PANELS[panel];

  const [range, setRange] = useState(() => {
    const from = sp.get("from");
    const to = sp.get("to");
    if (from && to) return { from, to };
    const [f, t] = presetRange("this-month");
    return { from: f, to: t };
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const applyRange = (r) => {
    setRange(r);
    setSp({ from: r.from, to: r.to }, { replace: true });
  };

  useEffect(() => {
    if (!cfg || !range.from || !range.to) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    axios
      .get(`${API_URL}/reports/detail`, {
        params: { panel, from: range.from, to: range.to },
      })
      .then((res) => {
        if (!cancelled) setRows(res.data.rows || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load list");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [panel, range.from, range.to, cfg]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportDetailList(panel, range);
    } catch (e) {
      showErrorSwal("Export failed", e.response?.data?.message || "Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (!cfg) {
    return (
      <div className="page-container">
        <div className="page-card">Unknown report list.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">{cfg.title}</div>
      </div>

      <Link to={cfg.back} className="report-back">
        ← Back to {cfg.report} Report
      </Link>

      <ReportToolbar
        range={range}
        onApply={applyRange}
        loading={loading}
        onExport={handleExport}
        exporting={exporting}
      />

      {error && (
        <div className="page-card" style={{ color: "#c0392b" }}>
          {error}
        </div>
      )}

      {!error && (
        <div className="page-card" style={{ padding: 0 }}>
          <DataTable
            columns={cfg.columns}
            data={rows}
            progressPending={loading}
            pagination
            paginationPerPage={25}
            paginationRowsPerPageOptions={[25, 50, 100]}
            highlightOnHover
            striped
            noDataComponent="No rows for this range."
          />
        </div>
      )}
    </div>
  );
}
