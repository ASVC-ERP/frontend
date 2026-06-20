import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ReturnPurchase.css";
import { showSuccessSwal, showErrorSwal, showWarningSwal, } from "../utils/swal";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReturnPurchaseModal({
  show,
  invoice,
  onClose,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (show && invoice) {
      setReason("");

      setItems(
        invoice.supplier_invoice_items.map((item) => ({
          item_id: item.id,
          product_id: item.product_id,
          item_code: item.products.item_code,
          item_name: item.products.item_name,
          unit: item.products.unit,
          quantity: Number(item.quantity),
          already_returned: Number(item.ret_qty || 0),
          return_qty: 0,
        }))
      );
    }
  }, [show, invoice]);

  if (!show) return null;

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
        item_id: item.item_id,
        ret_qty: Number(item.return_qty),
      }));

    if (!reason.trim()) {
      showWarningSwal("Missing Reason", "Please enter a return reason.");
      return;
    }

    if (returnItems.length === 0) {
      showWarningSwal("No Return Quantity", "Please enter at least one item with a return quantity greater than 0.");
      return;
    }

    try {
      await axios.post(`${API_URL}/supplier-invoice/${invoice.id}/return`, {
        reason,
        items: returnItems,
      });

      await showSuccessSwal(
        "Return Successful",
        "Items returned successfully."
      );
      onSuccess();
    } catch (err) {
      showErrorSwal( "Return Failed", err.response?.data?.message || "Something went wrong." );
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
              PO {invoice.po_number}  · Invoice {invoice.invoice_number}
              </span>
            </div>
  
            <button className="return-close-btn" onClick={onClose}>
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
                placeholder="Example: Damaged items, wrong delivery, defective stock..."
              />

              <div className={`reason-counter ${ reason.length > 129 ? "danger" : "" }`} >
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
                    <th>Purchased</th>
                    <th>Returned</th>
                    <th>Remaining</th>
                    <th>Return Qty</th>
                  </tr>
                </thead>
  
                <tbody>
                  {items.map((item) => {
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
                            disabled={remaining <= 0}
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
            <button className="return-cancel-btn" onClick={onClose}>
              Cancel
            </button>
  
            <button className="return-submit-btn" onClick={handleSubmit}>
              Submit Return
            </button>
          </div>
  
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,.5)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">

          <div className="modal-header text-white bg-danger">
            <h5 className="mb-0">
              Purchase Order No. {invoice.invoice_number}
            </h5>

            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-bold">Reason</label>
              <textarea
                className="form-control"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Example: Damaged items, wrong delivery, defective item..."
              />
            </div>

            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Item Code</th>
                  <th>Product</th>
                  <th>Purchased</th>
                  <th>Already Returned</th>
                  <th>Remaining</th>
                  <th>Return Qty</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const remaining = item.quantity - item.already_returned;

                  return (
                    <tr key={item.item_id}>
                      <td>{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{item.already_returned} {item.unit}</td>
                      <td>{remaining} {item.unit}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          className="form-control"
                          value={item.return_qty}
                          disabled={remaining <= 0}
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

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-danger" onClick={handleSubmit}>
              Return
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}