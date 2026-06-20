import React, { useEffect, useState } from "react";
import axios from "axios";

import "./EditPurchase.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditPurchaseModal({
  show,
  onClose,
  invoiceForm,
  setInvoiceForm,
  onSave,
}) {

  const [suggestions, setSuggestions] = useState({});
  const [queries, setQueries] = useState({});

  if (!show || !invoiceForm) return null;

  const searchProducts = async (index, value) => {
    setQueries((prev) => ({ ...prev, [index]: value }));

    if (value.trim().length < 2) {
      setSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    const res = await axios.get(`${API_URL}/product`, {
      params: {
        page: 1,
        limit: 10,
        search: value,
      },
    });

    setSuggestions((prev) => ({
      ...prev,
      [index]: res.data.data || [],
    }));
  };

  const selectProduct = (index, product) => {
    const updated = [...invoiceForm.items];

    updated[index] = {
      ...updated[index],
      product_id: product.id,
      itemName: product.item_name,
      itemCode: product.item_code,
      unit: product.unit,
    };

    setInvoiceForm({
      ...invoiceForm,
      items: updated,
    });

    setQueries((prev) => ({
      ...prev,
      [index]: product.item_name,
    }));

    setSuggestions((prev) => ({
      ...prev,
      [index]: [],
    }));
  };

  return (
    <div className="edit-purchase-backdrop">
      <div className="edit-purchase-modal">
        <div className="edit-purchase-content">
  
          {/* HEADER */}
          <div className="edit-purchase-header">
            <div>
              <h5>Edit Supplier Invoice</h5>
              <span>{invoiceForm.invoice_number}</span>
            </div>
  
            <button className="edit-close-btn" onClick={onClose}>
              ×
            </button>
          </div>
  
          {/* BODY */}
          <div className="edit-purchase-body">
            <div className="edit-form-card">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">PO Number</label>
                  <input
                    className="form-control"
                    value={invoiceForm.po_number}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, po_number: e.target.value })
                    }
                  />
                </div>
  
                <div className="col-md-3">
                  <label className="form-label">Invoice Number</label>
                  <input
                    className="form-control"
                    value={invoiceForm.invoice_number}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        invoice_number: e.target.value,
                      })
                    }
                  />
                </div>
  
                <div className="col-md-3">
                  <label className="form-label">Purchase Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={invoiceForm.purchase_date}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        purchase_date: e.target.value,
                      })
                    }
                  />
                </div>
  
                <div className="col-md-3">
                  <label className="form-label">Conversion Factor</label>
                  <input
                    type="number"
                    className="form-control"
                    value={invoiceForm.conversion_factor}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        conversion_factor: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
  
            <div className="edit-items-header">
              <div>
                <h6>Invoice Items</h6>
                <span>{invoiceForm.items.length} item(s)</span>
              </div>
  
              <button
                type="button"
                className="edit-add-btn"
                onClick={() => {
                  setInvoiceForm({
                    ...invoiceForm,
                    items: [
                      ...invoiceForm.items,
                      {
                        product_id: null,
                        itemName: "",
                        itemCode: "",
                        unit: "",
                        quantity: 1,
                        unit_cost: 0,
                      },
                    ],
                  });
                }}
              >
                + Add Item
              </button>
            </div>
            <p></p>
  
            <div className="edit-items-table">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th width="100">Unit</th>
                    <th width="120">Qty</th>
                    <th width="150">Unit Cost</th>
                    <th width="150">Subtotal</th>
                    <th width="90">Action</th>
                  </tr>
                </thead>
  
                <tbody>
                  {invoiceForm.items.map((item, index) => (
                    <tr key={index}>
                      <td className="product-search-cell">
                        <input
                          className="form-control"
                          placeholder="Search product..."
                          value={queries[index] ?? item.itemName ?? ""}
                          onChange={(e) => searchProducts(index, e.target.value)}
                        />
  
                        {suggestions[index]?.length > 0 && (
                          <div className="product-suggestion-box">
                            {suggestions[index].map((product) => (
                              <button
                                type="button"
                                key={product.id}
                                className="product-suggestion-item"
                                onClick={() => selectProduct(index, product)}
                              >
                                <div className="product-suggestion-name">
                                  {product.item_name}
                                </div>
                                <div className="product-suggestion-meta">
                                  {product.item_code} • {product.unit}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
  
                      <td className="unit-cell">{item.unit || "-"}</td>
  
                      <td>
                        <input
                          type="number"
                          className="form-control text-end"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...invoiceForm.items];
                            updated[index].quantity = Number(e.target.value);
  
                            setInvoiceForm({
                              ...invoiceForm,
                              items: updated,
                            });
                          }}
                        />
                      </td>
  
                      <td>
                        <input
                          type="number"
                          className="form-control text-end"
                          value={item.unit_cost}
                          onChange={(e) => {
                            const updated = [...invoiceForm.items];
                            updated[index].unit_cost = Number(e.target.value);
  
                            setInvoiceForm({
                              ...invoiceForm,
                              items: updated,
                            });
                          }}
                        />
                      </td>
  
                      <td className="edit-subtotal">
                        ₱
                        {(
                          item.quantity *
                          item.unit_cost *
                          invoiceForm.conversion_factor
                        ).toLocaleString()}
                      </td>
  
                      <td>
                        <button
                          type="button"
                          className="edit-remove-btn"
                          onClick={() => {
                            const updated = invoiceForm.items.filter(
                              (_, i) => i !== index
                            );
  
                            setInvoiceForm({
                              ...invoiceForm,
                              items: updated,
                            });
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            <div className="edit-total-box">
              <div className="edit-total-card">
                <span className="edit-total-label">Grand Total</span>
                <span className="edit-total-value">
                  ₱
                  {invoiceForm.items
                    .reduce(
                      (sum, item) =>
                        sum +
                        item.quantity *
                          item.unit_cost *
                          invoiceForm.conversion_factor,
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
  
          {/* FOOTER */}
          <div className="edit-purchase-footer">
            <button className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
  
            <button className="btn btn-primary" onClick={onSave}>
              Save Changes
            </button>
          </div>
  
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">

          {/* HEADER */}
          <div
            className="modal-header text-white"
            style={{
              background:
                "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
            }}
          >
            <h5 className="mb-0">
              Edit Supplier Invoice — {invoiceForm.invoice_number}
            </h5>

            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          {/* BODY */}
          <div className="modal-body">

            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label">PO Number</label>
                <input
                  className="form-control"
                  value={invoiceForm.po_number}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      po_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Invoice Number</label>
                <input
                  className="form-control"
                  value={invoiceForm.invoice_number}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      invoice_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={invoiceForm.purchase_date}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      purchase_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Conversion Factor
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={invoiceForm.conversion_factor}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      conversion_factor: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mb-3">
              <button
                className="btn btn-success"
                onClick={() => {
                  setInvoiceForm({
                    ...invoiceForm,
                    items: [
                      ...invoiceForm.items,
                      {
                        item_id: "",
                        itemName: "",
                        unit: "",
                        quantity: 1,
                        unit_cost: 0,
                      },
                    ],
                  });
                }}
              >
                + Add Item
              </button>
            </div>

            {/* ITEMS TABLE */}
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Unit</th>
                  <th width="120">Qty</th>
                  <th width="150">Unit Cost</th>
                  <th width="150">Subtotal</th>
                  <th width="100">Action</th>
                </tr>
              </thead>

              <tbody>
                {invoiceForm.items.map((item, index) => (
                  <tr key={index}>
                    <td className="position-relative">
                      <input
                        className="form-control"
                        placeholder="Search product..."
                        value={queries[index] ?? item.itemName ?? ""}
                        onChange={(e) => searchProducts(index, e.target.value)}
                      />

                      {suggestions[index]?.length > 0 && (
                        <div
                          className="list-group position-absolute w-100 shadow"
                          style={{ zIndex: 9999 }}
                        >
                          {suggestions[index].map((product) => (
                            <button
                              type="button"
                              key={product.id}
                              className="list-group-item list-group-item-action"
                              onClick={() => selectProduct(index, product)}
                            >
                              <div className="fw-semibold">{product.item_name}</div>
                              <small className="text-muted">
                                {product.item_code} • {product.unit}
                              </small>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    <td>{item.unit}</td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...invoiceForm.items];

                          updated[index].quantity = Number(
                            e.target.value
                          );

                          setInvoiceForm({
                            ...invoiceForm,
                            items: updated,
                          });
                        }}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.unit_cost}
                        onChange={(e) => {
                          const updated = [...invoiceForm.items];

                          updated[index].unit_cost = Number(
                            e.target.value
                          );

                          setInvoiceForm({
                            ...invoiceForm,
                            items: updated,
                          });
                        }}
                      />
                    </td>

                    <td>
                      ₱
                      {(
                        item.quantity *
                        item.unit_cost *
                        invoiceForm.conversion_factor
                      ).toLocaleString()}
                    </td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          const updated = invoiceForm.items.filter(
                            (_, i) => i !== index
                          );

                          setInvoiceForm({
                            ...invoiceForm,
                            items: updated,
                          });
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-end">
              <h5>
                Total: ₱
                {invoiceForm.items
                  .reduce(
                    (sum, item) =>
                      sum +
                      item.quantity *
                        item.unit_cost *
                        invoiceForm.conversion_factor,
                    0
                  )
                  .toLocaleString()}
              </h5>
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={onSave}
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}