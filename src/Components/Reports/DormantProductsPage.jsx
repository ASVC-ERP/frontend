import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import { showErrorSwal } from "../../utils/swal";
import "../../styles/page.css";
import "../../styles/buttons.css";
import "./reports.css";

const API_URL = import.meta.env.VITE_API_URL;

// Full list behind both "View full" links: Sales Report's teaser (stock=in)
// and the Dashboard's zero-stock panel (stock=out). Not date-ranged --
// "no activity in 90 days" is always relative to today.
export default function DormantProductsPage() {
  const [sp] = useSearchParams();
  const stock = sp.get("stock") === "out" ? "out" : "in";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [clearSelection, setClearSelection] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    axios
      .get(`${API_URL}/product/dormant`, { params: { stock } })
      .then((res) => {
        if (!cancelled) setRows(res.data || []);
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
  }, [stock]);

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

  const bulkSetStatus = async (nextStatus) => {
    const ids = selected.map((r) => r.product_id);
    if (!ids.length) return;
    setBulkSaving(true);
    try {
      await axios.patch(`${API_URL}/product/bulk-status`, { ids, status: nextStatus });
      setRows((prev) =>
        prev.map((r) => (ids.includes(r.product_id) ? { ...r, status: nextStatus } : r)),
      );
      setSelected([]);
      setClearSelection((c) => !c);
    } catch (e) {
      showErrorSwal("Update failed", e.response?.data?.message || "Please try again.");
    } finally {
      setBulkSaving(false);
    }
  };

  const columns = [
    { name: "Code", selector: (r) => r.item_code || "—", sortable: true, width: "120px" },
    {
      name: "Description",
      selector: (r) => r.description || `Product ${r.product_id}`,
      sortable: true,
      grow: 2,
      wrap: true,
    },
    { name: "Stock", selector: (r) => r.stock ?? 0, sortable: true, right: true, width: "90px" },
    {
      name: "Status",
      width: "110px",
      center: true,
      cell: (r) => {
        const inactive = r.status === "inactive";
        return (
          <span
            style={{
              display: "inline-block",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              padding: "2px 10px",
              borderRadius: 999,
              background: inactive ? "#fef2f2" : "#f0fdf4",
              color: inactive ? "#dc2626" : "#16a34a",
            }}
          >
            {inactive ? "Inactive" : "Active"}
          </span>
        );
      },
    },
    { name: "Last Sale", selector: (r) => r.last_sold || "Never", sortable: true },
    { name: "Last Purchase", selector: (r) => r.last_purchased || "Never", sortable: true },
    {
      name: "Days Idle",
      selector: (r) => (r.days_ago == null ? "—" : r.days_ago),
      sortable: true,
      right: true,
      width: "100px",
    },
    {
      name: "Action",
      width: "160px",
      center: true,
      ignoreRowClick: true,
      cell: (r) => (
        <button
          type="button"
          className="btn-secondary-custom"
          style={{ minWidth: 0, height: 30, padding: "0 12px", fontSize: 13 }}
          disabled={togglingId === r.product_id}
          onClick={() =>
            toggleStatus(r.product_id, r.status === "inactive" ? "active" : "inactive")
          }
        >
          {togglingId === r.product_id
            ? "Saving…"
            : r.status === "inactive"
              ? "Mark Active"
              : "Mark Inactive"}
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">No Recent Activity ({stock === "out" ? "Out of Stock" : "In Stock"})</div>
      </div>

      <Link to={stock === "out" ? "/" : "/reports/sales"} className="report-back">
        ← Back to {stock === "out" ? "Dashboard" : "Sales Report"}
      </Link>

      <p className="page-subtitle" style={{ margin: "0 0 16px" }}>
        Products with no sale or purchase in the last 90 days. Mark an item Inactive once you've
        decided it's discontinued — it won't change on its own.
      </p>

      {error && (
        <div className="page-card" style={{ color: "#c0392b" }}>
          {error}
        </div>
      )}

      {!error && selected.length > 0 && (
        <div
          className="page-toolbar"
          style={{ alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}
        >
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
            {selected.length} selected
          </span>
          <button
            type="button"
            className="btn-secondary-custom"
            disabled={bulkSaving}
            onClick={() => bulkSetStatus("inactive")}
          >
            {bulkSaving ? "Saving…" : "Mark Inactive"}
          </button>
        </div>
      )}

      {!error && (
        <div className="page-card" style={{ padding: 0 }}>
          <DataTable
            className="custom-data-table"
            keyField="product_id"
            columns={columns}
            data={rows}
            progressPending={loading}
            pagination
            paginationPerPage={25}
            paginationRowsPerPageOptions={[25, 50, 100]}
            highlightOnHover
            striped
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={({ selectedRows }) => setSelected(selectedRows)}
            clearSelectedRows={clearSelection}
            noDataComponent="Nothing dormant in this range. 🎉"
          />
        </div>
      )}
    </div>
  );
}
