import { useEffect, useState } from "react";
import axios from "axios";
import {
  showErrorSwal,
  showSuccessSwal,
  showWarningSwal,
} from "../../utils/swal";
import "../../styles/modal.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function SalesInvoiceReturnModal({
  invoice,
  onClose,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!invoice) return;

    setReason("");

    console.log("invoice: ", invoice);

    const invoiceItems = invoice.items || invoice.sales_invoice_items || [];

    setItems(
      invoiceItems.map((item) => {
        const product = item.products || item.product || item.item || {};
        console.log("item: ", item);

        return {
          item_id: item.id,
          product_id: item.product_id || item.item_id || product.id,
          item_code: product.item_code || "—",
          item_name: product.item_name || "—",
          unit: product.unit || "—",
          quantity: Number(item.quantity || 0),
          already_returned: Number(item.return_qty || 0),
          return_qty: 0,
        };
      })
    );
  }, [invoice]);

  const updateReturnQty = (itemId, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.item_id !== itemId) return item;

        const maxReturn = item.quantity - item.already_returned;
        let qty = Number(value);

        if (qty < 0) qty = 0;
        if (qty > maxReturn) qty = maxReturn;

        return {
          ...item,
          return_qty: qty,
        };
      })
    );
  };

  const handleSubmit = async () => {
    const returnItems = items
      .filter((item) => Number(item.return_qty) > 0)
      .map((item) => ({
        invoice_item_id: item.item_id,
        return_qty: Number(item.return_qty),
      }));

    if (!reason.trim()) {
      showWarningSwal("Missing Reason", "Please enter a return reason.");
      return;
    }

    if (returnItems.length === 0) {
      showWarningSwal(
        "No Return Quantity",
        "Please enter at least one item with a return quantity greater than 0."
      );
      return;
    }

    try {
      setSaving(true);

      await axios.post(`${API_URL}/invoice`, {
        invoice_id: invoice.id,
        reason,
        items: returnItems,
      });

      showSuccessSwal("Return Saved", "Sales return has been recorded.");
      await onSuccess();
    } catch (err) {
      console.error("Failed to create sales return:", err);

      showErrorSwal(
        "Return Failed",
        err.response?.data?.message || "Failed to create sales return."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="return-purchase-backdrop">
      <div className="return-purchase-modal">
        <div className="return-purchase-content">
          <div className="return-purchase-header">
            <div>
              <h5>Return Items</h5>
              <span>
                Sales Order {String(invoice.order_id).padStart(4, "0")} ·
                Invoice {invoice.invoice_number || "—"}
              </span>
            </div>

            <button
              className="return-close-btn"
              onClick={onClose}
              disabled={saving}
            >
              ×
            </button>
          </div>

          <div className="return-purchase-body">
            <div className="mb-4">
              <label className="form-label">Return Reason</label>

              <textarea
                className="form-control"
                rows="3"
                maxLength={150}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Example: Customer returned item, wrong item delivered, damaged item..."
              />

              <div
                className={`reason-counter ${
                  reason.length > 129 ? "danger" : ""
                }`}
              >
                {reason.length}/150 characters
              </div>
            </div>

            <div className="return-items-table">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Product</th>
                    <th>Unit</th>
                    <th>Sold</th>
                    <th>Returned</th>
                    <th>Remaining</th>
                    <th>Return Qty</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    //console.log("show: ", item)
                    const remaining = item.quantity - item.already_returned;

                    return (
                      <tr key={item.item_id}>
                        <td className="return-code">{item.item_code}</td>

                        <td>
                          <div className="return-product-name">
                            {item.item_name}
                          </div>
                        </td>

                        <td>
                          <div className="return-product-meta">
                            {item.unit}
                          </div>
                        </td>

                        <td>{item.quantity}</td>
                        <td>{item.already_returned}</td>

                        <td>
                          <span
                            className={
                              remaining <= 0
                                ? "return-badge empty"
                                : "return-badge"
                            }
                          >
                            {remaining}
                          </span>
                        </td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            max={remaining}
                            className="form-control return-qty-input"
                            value={item.return_qty}
                            disabled={remaining <= 0 || saving}
                            onChange={(e) =>
                              updateReturnQty(item.item_id, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="return-purchase-footer">
            <button
              className="return-cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className="return-submit-btn"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Submitting..." : "Submit Return"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}