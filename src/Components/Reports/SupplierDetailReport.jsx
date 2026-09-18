import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import ReportToolbar from "./ReportToolbar";
import { presetRange } from "./dateRange";
import { peso } from "./format";
import { exportSupplierDetail } from "./exportReport";
import { showErrorSwal } from "../../utils/swal";
import KpiCard from "./parts/KpiCard";
import Panel from "./parts/Panel";
import MonthlyRevenueChart from "./parts/MonthlyRevenueChart";
import "../../styles/page.css";
import "../../styles/buttons.css";
import "./reports.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function SupplierDetailReport() {
  const { id } = useParams();
  const [sp, setSp] = useSearchParams();

  const [range, setRange] = useState(() => {
    const from = sp.get("from");
    const to = sp.get("to");
    if (from && to) return { from, to };
    const [f, t] = presetRange("this-month");
    return { from: f, to: t };
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const applyRange = (r) => {
    setRange(r);
    setSp({ from: r.from, to: r.to }, { replace: true });
  };

  useEffect(() => {
    if (!id || !range.from || !range.to) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    axios
      .get(`${API_URL}/reports/suppliers/${id}`, {
        params: { from: range.from, to: range.to },
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load supplier");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, range.from, range.to]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportSupplierDetail(id, range);
    } catch (e) {
      showErrorSwal("Export failed", e.response?.data?.message || "Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const p = data?.profile;
  const k = data?.kpis;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Supplier Detail</div>
      </div>

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

      {!error && (!data || loading) && (
        <div className="page-card" style={{ color: "#64748b" }}>Loading supplier…</div>
      )}

      {!error && data && !loading && (
        <>
          <div className="page-card">
            <div className="customer-profile-head">
              <div>
                <div className="customer-profile-name">{p.name || `Supplier ${id}`}</div>
                <div className="customer-meta">
                  <div>
                    <div className="k">Address</div>
                    <div className="v">{p.address || "—"}</div>
                  </div>
                  <div>
                    <div className="k">Currency</div>
                    <div className="v">{p.currency || "—"}</div>
                  </div>
                  <div>
                    <div className="k">Number</div>
                    <div className="v">{p.number || "—"}</div>
                  </div>
                  <div>
                    <div className="k">Supplier Since</div>
                    <div className="v">
                      {p.supplier_since
                        ? new Date(p.supplier_since).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="report-kpis" style={{ marginTop: 16 }}>
            <KpiCard label="Lifetime Spend" value={peso(k.lifetime_spend)} />
            <KpiCard label="Total Orders" value={k.total_orders} />
            <KpiCard label="Avg Order Value" value={peso(k.avg_order_value)} />
            <KpiCard label="Total Items Purchased" value={k.total_items} />
          </div>

          <div className="report-panel" style={{ marginBottom: 16 }}>
            <div className="report-panel-title">Monthly Spend</div>
            <MonthlyRevenueChart data={data.monthly_spend} metricLabel="spend" />
          </div>

          <div className="customer-detail-grid">
            <Panel
              title="Top Products Purchased"
              empty={!data.top_products.length && "No purchases yet."}
            >
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "right" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_products.map((r) => (
                    <tr key={r.product_id}>
                      <td>{r.description || `Product ${r.product_id}`}</td>
                      <td className="num">{r.quantity}</td>
                      <td className="num">{peso(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Panel
              title="Recent Orders"
              empty={!data.orders.length && "No orders in this range."}
            >
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Items</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o) => (
                    <tr key={o.invoice_id}>
                      <td>{o.invoice_number || `INV-${o.invoice_id}`}</td>
                      <td>{o.date}</td>
                      <td className="num">{o.items}</td>
                      <td className="num">{peso(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
