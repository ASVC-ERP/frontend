import { useState, useEffect } from "react";
import axios from "axios";
import { debug } from "../../../utils/log";

function CostHistoryTab({ item }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemID = item?.id || "";

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!itemID) {
        setData([]);
        setLoading(false);
        console.warn("No itemID provided, skipping fetch.");
        return;
      }
      setLoading(true);
      try {
        const costRes = await axios.get(
          `${API_URL}/supplier-invoice/costs/${itemID}`
        );
        const costData = costRes.data || [];
        debug(costData);
        setData(costData);
      } catch (error) {
        console.error("❌ Error fetching cost history:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemID]);

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
  };

  const formatCost = (value) =>
    value
      ? Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })
      : "";

  return (
    <div className="details-table-card">
      <div className="details-table-header">
        <div className="details-table-title">Cost History</div>
        <div className="details-item-count">
          {data.length} entr{data.length === 1 ? "y" : "ies"}
        </div>
      </div>

      {loading ? (
        <div className="details-table-empty">Loading…</div>
      ) : data.length === 0 ? (
        <div className="details-table-empty">
          No cost history for this item.
        </div>
      ) : (
        <div className="details-table-scroll">
          <table className="details-table">
            <thead>
              <tr>
                <th>PO #</th>
                <th>Date</th>
                <th>Invoice ID</th>
                <th>Quantity</th>
                <th>Currency</th>
                <th>Conversion Factor</th>
                <th>Cost</th>
                <th>Supplier</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={row.id ?? i}>
                  <td>{row.supplier_invoices?.po_number ?? ""}</td>
                  <td>{formatDate(row.supplier_invoices?.purchase_date)}</td>
                  <td>{row.supplier_invoices?.invoice_number ?? ""}</td>
                  <td className="details-num">{Number(row.quantity ?? 0)}</td>
                  <td>{row.supplier_invoices?.suppliers?.currency ?? ""}</td>
                  <td className="details-num">
                    {Number(row.supplier_invoices?.conversion_factor ?? 0)}
                  </td>
                  <td className="details-num">{formatCost(row.unit_cost)}</td>
                  <td>{row.supplier_invoices?.suppliers?.name ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CostHistoryTab;
