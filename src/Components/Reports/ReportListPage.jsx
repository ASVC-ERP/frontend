import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import ReportToolbar from "./ReportToolbar";
import CityPie from "./parts/CityPie";
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
    sortOptions: [
      { value: "total", label: "Sales Value" },
      { value: "brand", label: "Brand" },
      { value: "quantity", label: "Quantity" },
    ],
    columns: [
      {
        name: "Rank",
        selector: (r) => r.__rank,
        width: "80px",
      },
      { name: "Code", selector: (r) => r.item_code || "—", sortable: true },
      { name: "Description", selector: (r) => r.description || "—", sortable: true, grow: 2, wrap: true },
      { name: "Brand", selector: (r) => r.brand || "—", sortable: true },
      {
        name: "Quantity",
        selector: (r) => Number(r.quantity) || 0,
        sortable: true,
        right: true,
      },
      { ...money(null, "total"), name: "Sales Value" },
    ],
  },
  top_customers: {
    report: "Sales",
    back: "/reports/sales",
    title: "Customer Rankings",
    columns: [
      {
        name: "Rank",
        selector: (r) => r.__rank,
        width: "80px",
      },
      { name: "Customer", selector: (r) => r.name || "—", sortable: true, grow: 2, wrap: true },
      { name: "City", selector: (r) => r.city || "—", sortable: true },
      {
        name: "Total Orders",
        selector: (r) => Number(r.total_orders) || 0,
        sortable: true,
        right: true,
      },
      { ...money(null, "total"), name: "Total Sales" },
    ],
  },
  slow_moving: {
    report: "Sales",
    back: "/reports/sales",
    title: "Slow-Moving Products",
    columns: [
      {
        name: "Rank",
        selector: (r) => r.__rank,
        width: "80px",
      },
      { name: "Code", selector: (r) => r.item_code || "—", sortable: true },
      {
        name: "Description",
        selector: (r) => r.description || `Product ${r.product_id}`,
        sortable: true,
        grow: 2,
        wrap: true,
      },
      { name: "Last Sale", selector: (r) => r.last_sold || "Never", sortable: true },
      {
        name: "Last Order",
        selector: (r) => (r.last_order_id ? `ORD${String(r.last_order_id).padStart(4, "0")}` : "—"),
        sortable: true,
      },
    ],
  },
  pnl_by_brand: {
    report: "Sales",
    back: "/reports/sales",
    title: "Profit and Loss by Brand",
    columns: [
      {
        name: "Rank",
        selector: (r) => r.__rank,
        width: "80px",
      },
      { name: "Brand", selector: (r) => r.brand || "—", sortable: true, grow: 2, wrap: true },
      { ...money(null, "revenue"), name: "Revenue" },
      {
        name: "COGS",
        selector: (r) => Number(r.revenue || 0) - Number(r.profit || 0),
        format: (r) => `-${peso(Number(r.revenue || 0) - Number(r.profit || 0))}`,
        sortable: true,
        right: true,
        cell: (r) => (
          <span style={{ color: "#c0392b" }}>
            -{peso(Number(r.revenue || 0) - Number(r.profit || 0))}
          </span>
        ),
      },
      {
        ...money(null, "profit"),
        name: "Gross Margin",
        cell: (r) => <span style={{ color: "#16a34a" }}>{peso(r.profit)}</span>,
      },
      {
        name: "Gross Profit",
        selector: (r) => Number(r.margin_pct) || 0,
        format: (r) => `${Number(r.margin_pct) || 0}%`,
        sortable: true,
        right: true,
      },
    ],
  },
  customers_by_city: {
    report: "Customer",
    back: "/reports/customers",
    title: "Revenue by City",
    isCityPanel: true,
    columns: [
      {
        name: "Rank",
        selector: (r) => r.__rank,
        width: "80px",
      },
      { name: "City", selector: (r) => r.city || "—", sortable: true, grow: 2, wrap: true },
      {
        name: "Market Share %",
        selector: (r) => r.__sharePct || 0,
        format: (r) => `${r.__sharePct}%`,
        sortable: true,
        right: true,
      },
      { ...money(null, "total"), name: "Revenue" },
    ],
  },
  top_products: {
    report: "Purchase",
    back: "/reports/purchases",
    title: "Top Purchased Products",
    sortOptions: [
      { value: "total", label: "Purchased Value" },
      { value: "brand", label: "Brand" },
      { value: "quantity", label: "Quantity" },
    ],
    columns: [
      {
        name: "Rank",
        selector: (r) => r.__rank,
        width: "80px",
      },
      { name: "Code", selector: (r) => r.item_code || "—", sortable: true },
      { name: "Description", selector: (r) => r.description || "—", sortable: true, grow: 2, wrap: true },
      { name: "Brand", selector: (r) => r.brand || "—", sortable: true },
      {
        name: "Quantity",
        selector: (r) => Number(r.quantity) || 0,
        sortable: true,
        right: true,
      },
      { ...money(null, "total"), name: "Purchased Value" },
    ],
  },
  top_suppliers: {
    report: "Purchase",
    back: "/reports/purchases",
    title: "Supplier Rankings",
    columns: [
      {
        name: "Rank",
        selector: (r) => r.__rank,
        width: "80px",
      },
      { name: "Supplier", selector: (r) => r.name || "—", sortable: true, grow: 2, wrap: true },
      {
        name: "Total Orders",
        selector: (r) => Number(r.total_orders) || 0,
        sortable: true,
        right: true,
      },
      { ...money(null, "total"), name: "Total Purchases" },
    ],
  },
  suppliers_by_currency: {
    report: "Supplier",
    back: "/reports/suppliers",
    title: "Spend by Currency",
    isCityPanel: true,
    groupKey: "currency",
    metricLabel: "spend",
    columns: [
      {
        name: "Rank",
        selector: (r) => r.__rank,
        width: "80px",
      },
      { name: "Currency", selector: (r) => r.currency || "—", sortable: true, grow: 2, wrap: true },
      {
        name: "Market Share %",
        selector: (r) => r.__sharePct || 0,
        format: (r) => `${r.__sharePct}%`,
        sortable: true,
        right: true,
      },
      { ...money(null, "total"), name: "Spend" },
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
  const [sortField, setSortField] = useState(cfg?.sortOptions?.[0]?.value);
  const [togglingId, setTogglingId] = useState(null);

  // Slow-Moving Products panel only: flips a product's status in place
  // (no refetch) so the row stays visible -- it's a worklist, not a
  // disappearing-on-action list.
  const toggleStatus = async (productId, nextStatus) => {
    setTogglingId(productId);
    try {
      await axios.patch(`${API_URL}/product/${productId}/status`, { status: nextStatus });
      setRows((prev) =>
        prev.map((r) => (r.product_id === productId ? { ...r, status: nextStatus } : r)),
      );
    } catch (e) {
      showErrorSwal("Update failed", e.response?.data?.message || "Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const columns =
    typeof cfg?.columns === "function" ? cfg.columns(toggleStatus, togglingId) : cfg?.columns;

  useEffect(() => {
    setSortField(cfg?.sortOptions?.[0]?.value);
  }, [panel, cfg]);

  const applyRange = (r) => {
    setRange(r);
    setSp({ from: r.from, to: r.to }, { replace: true });
  };

  const displayRows = (() => {
    const sorted = cfg?.sortOptions
      ? [...rows].sort((a, b) =>
          sortField === "brand"
            ? String(a.brand || "").localeCompare(String(b.brand || ""))
            : Number(b[sortField]) - Number(a[sortField])
        )
      : rows;

    if (cfg?.isCityPanel) {
      const grandTotal = sorted.reduce((sum, r) => sum + Number(r.total || 0), 0);
      return sorted.map((r, i) => ({
        ...r,
        __rank: i + 1,
        __sharePct: grandTotal > 0 ? Math.round((Number(r.total || 0) / grandTotal) * 100) : 0,
      }));
    }

    return sorted.map((r, i) => ({ ...r, __rank: i + 1 }));
  })();

  const groupKey = cfg?.groupKey || "city";
  const metricLabel = cfg?.metricLabel || "revenue";
  const topCity = cfg?.isCityPanel ? displayRows[0] : null;

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

      {cfg.isCityPanel && !loading && !error && topCity && (
        <div className="report-row-2" style={{ marginBottom: 16 }}>
          <div className="kpi-card" style={{ borderTopColor: "#1e5a84" }}>
            <div className="kpi-label">Top Performer</div>
            <div className="kpi-value" style={{ fontSize: "2.2rem" }}>
              {topCity[groupKey]}
            </div>
            <div className="kpi-sub">
              Largest share at {topCity.__sharePct}% of total {metricLabel} in this range.
            </div>
          </div>

          <div className="report-panel">
            <div className="report-panel-title">Market Share</div>
            <CityPie data={displayRows} labelKey={groupKey} />
          </div>
        </div>
      )}

      {cfg.sortOptions && (
        <div className="page-toolbar">
          <div className="search-group" style={{ justifyContent: "flex-end" }}>
            <select
              className="form-select"
              style={{ maxWidth: 190 }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              {cfg.sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="page-card" style={{ color: "#c0392b" }}>
          {error}
        </div>
      )}

      {cfg.isCityPanel && !error && (
        <div className="report-panel-title" style={{ margin: "4px 0 8px" }}>
          All Regional Data
        </div>
      )}

      {!error && (
        <div className="page-card" style={{ padding: 0 }}>
          <DataTable
            className="custom-data-table"
            columns={columns}
            data={displayRows}
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
