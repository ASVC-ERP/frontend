import { useMemo, useState } from "react";
import axios from "axios";
import "../../styles/modal.css";
import { showSuccessSwal, showErrorSwal, showWarningSwal, showLoadingSwal, } from "../../utils/swal";

const API_URL = import.meta.env.VITE_API_URL;

export default function ServeOrderModal({ order, roleApprove, onClose, onSuccess }) {
  const [items, setItems] = useState(
    (order.items || []).map((item) => ({
      ...item,
      serve_qty: "",
    }))
  );

  const [saving, setSaving] = useState(false);

  const hasAnyServe = useMemo(() => {
    return items.some((item) => Number(item.serve_qty || 0) > 0);
  }, [items]);

  const updateServeQuantity = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const orderedQty = Number(item.quantity || 0);
        const currentServed = Number(item.served_qty || item.prev_serve_qty || 0);
        const remainingQty = orderedQty - currentServed;

        let qty = Number(value || 0);

        if (qty < 0) qty = 0;
        if (qty > remainingQty) qty = remainingQty;

        return {
          ...item,
          serve_qty: qty,
        };
      })
    );
  };

  const handleSubmit = async () => {
    try {
      for (const item of items) {
        const serveQty = Number(item.serve_qty || 0);
        const stockQty = Number(item.products?.stock || 0);

        if (serveQty > stockQty) {
          showErrorSwal(
            `${item.products?.item_name} only has ${stockQty} stock available.`
          );
          return;
        }
      }

      if (!hasAnyServe) {
        showErrorSwal("Please enter a quantity to serve for at least one item.");
        return;
      }

      const payload = {
        items: items
          .filter((item) => Number(item.serve_qty || 0) > 0)
          .map((item) => ({
            order_item_id: item.id,
            serve_qty: Number(item.serve_qty),
          })),
      };

      setSaving(true);

      const isAdmin = roleApprove?.toLowerCase() === "admin";

      if (isAdmin) {
        await axios.post(`${API_URL}/order/id/${order.id}/serve`, payload, {
          params: { roleApprove },
        });
      } else {
        await axios.post(`${API_URL}/order/id/${order.id}/request`, payload, {
          params: { roleApprove },
        });
      }

      showSuccessSwal(
        isAdmin
          ? "Order served successfully."
          : "Serve request submitted successfully."
      );

      onSuccess?.();
    } catch (err) {
      console.error("Serve order error:", err);
      showErrorSwal(err.response?.data?.message || "Failed to serve order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-modal-backdrop">
      <div className="app-modal app-modal-md">
        <div className="app-modal-content">
          <div className="app-modal-header">
            <div>
              <div className="app-modal-title">
                Serve Order ORD{String(order.id).padStart(4, "0")}
              </div>
              <div className="app-modal-subtitle">
                Enter quantities to serve
              </div>
            </div>

            <button type="button" className="app-modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="app-modal-body">
            <div className="details-table-card mb-0">
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Stock</th>
                    <th>Ordered</th>
                    <th>To Serve</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{item.products?.item_name || "—"}</td>

                      <td className="details-num">
                        {item.products?.stock ?? 0}
                      </td>

                      <td className="details-num">
                        {item.quantity || 0}
                      </td>

                      <td className="details-num">
                        <input
                          type="number"
                          className="form-control text-end"
                          value={item.serve_qty}
                          min="0"
                          max={item.quantity}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) =>
                            updateServeQuantity(index, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="app-modal-footer">
            <button
              type="button"
              className="btn-secondary-custom"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-primary-custom"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving..." : "Serve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}