import { useState, useEffect } from "react";
import axios from "axios";

function SalesInvoiceHistoryTab({ item }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemId = item?.id || 0;

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/invoice/item/${itemId}/history`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching Sales Invoice History:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  return (
    <div className="details-table-card">
      <div className="details-table-header">
        <div className="details-table-title">Sales Invoice History</div>
        <div className="details-item-count">
          {data.length} invoice{data.length === 1 ? "" : "s"}
        </div>
      </div>

      {loading ? (
        <div className="details-table-empty">Loading…</div>
      ) : data.length === 0 ? (
        <div className="details-table-empty">
          No sales invoice history for this item.
        </div>
      ) : (
        <div className="details-table-scroll">
          <table className="details-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice No.</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Returned</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr key={row.invoice_id}>
                  <td>{row.invoice_date}</td>
                  <td>{row.invoice_number}</td>
                  <td className="details-num">{row.order_id}</td>
                  <td>{row.customer_name}</td>
                  <td className="details-num">{formatCurrency(row.price)}</td>
                  <td className="details-num">{row.quantity}</td>
                  <td className="details-num">{row.return_qty}</td>
                  <td className="details-subtotal">
                    {formatCurrency((row.price ?? 0) * (row.quantity ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SalesInvoiceHistoryTab;
