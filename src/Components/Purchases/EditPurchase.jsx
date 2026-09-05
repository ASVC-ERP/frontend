import React, { useRef, useState } from "react";
import axios from "axios";
import "../../styles/modal.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditPurchaseModal({
  show,
  onClose,
  invoiceForm,
  setInvoiceForm,
  onSave,
}) {
  const inputRefs = useRef([]);

  const [queries, setQueries] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);

  const [supplierQuery, setSupplierQuery] = useState(null);
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);

  if (!show || !invoiceForm) return null;

  const searchSuppliers = async (value) => {
    setSupplierQuery(value);

    if (value.trim().length < 2) {
      setSupplierSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/supplier`, {
        params: { search: value, limit: 20 },
      });

      setSupplierSuggestions(res.data.data || []);
    } catch (err) {
      console.error("Supplier search failed:", err);
      setSupplierSuggestions([]);
    }
  };

  const selectSupplier = (supplier) => {
    setInvoiceForm({
      ...invoiceForm,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
    });

    setSupplierQuery(supplier.name);
    setSupplierSuggestions([]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...invoiceForm.items];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setInvoiceForm({
      ...invoiceForm,
      items: updated,
    });
  };

  const updateDropdownPosition = (index) => {
    const input = inputRefs.current[index];
    if (!input) return;

    const rect = input.getBoundingClientRect();

    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  const searchProducts = async (index, value) => {
    setActiveIndex(index);
    setQueries((prev) => ({ ...prev, [index]: value }));
    updateDropdownPosition(index);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/product`, {
        params: {
          page: 1,
          limit: 10,
          search: value,
        },
      });

      setSuggestions(res.data.data || []);
    } catch (err) {
      console.error("Product search failed:", err);
      setSuggestions([]);
    }
  };

  const selectProduct = (product) => {
    if (activeIndex === null) return;

    const updated = [...invoiceForm.items];

    updated[activeIndex] = {
      ...updated[activeIndex],
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
      [activeIndex]: product.item_name,
    }));

    setSuggestions([]);
    setActiveIndex(null);
    setDropdownPos(null);
  };

  const addItem = () => {
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
  };

  const removeItem = (index) => {
    const updated = invoiceForm.items.filter((_, i) => i !== index);

    setInvoiceForm({
      ...invoiceForm,
      items: updated,
    });

    setSuggestions([]);
    setActiveIndex(null);
    setDropdownPos(null);
  };

  const grandTotal = invoiceForm.items.reduce((sum, item) => {
    return (
      sum +
      Number(item.quantity || 0) *
        Number(item.unit_cost || 0) *
        Number(invoiceForm.conversion_factor || 1)
    );
  }, 0);

  return (
    <>
      <div className="app-modal-backdrop">
        <div className="app-modal">
          <div className="app-modal-content">
            <div className="app-modal-header">
              <div>
                <div className="app-modal-title">Edit Purchase</div>
                <div className="app-modal-subtitle">
                  {invoiceForm.invoice_number}
                </div>
              </div>

              <button type="button" className="app-modal-close" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="app-modal-body">
              <div className="modal-form">
                <div className="modal-form-section">
                  <div className="modal-form-section-title">
                    Purchase Details
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4 position-relative">
                      <label className="form-label">Supplier</label>
                      <input
                        className="form-control"
                        placeholder="Search supplier..."
                        value={supplierQuery ?? invoiceForm.supplier_name ?? ""}
                        onChange={(e) => searchSuppliers(e.target.value)}
                      />

                      {supplierSuggestions.length > 0 && (
                        <div className="modal-suggestions">
                          {supplierSuggestions.map((supplier) => (
                            <div
                              key={supplier.id}
                              className="modal-suggestion-item"
                              onClick={() => selectSupplier(supplier)}
                            >
                              {supplier.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">PO Number</label>
                      <input
                        className="form-control"
                        value={invoiceForm.po_number || ""}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            po_number: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Invoice Number</label>
                      <input
                        className="form-control"
                        value={invoiceForm.invoice_number || ""}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            invoice_number: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Purchase Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={invoiceForm.purchase_date || ""}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            purchase_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Conversion Factor</label>
                      <input
                        type="number"
                        className="form-control"
                        value={invoiceForm.conversion_factor || 0}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            conversion_factor: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        rows={5}
                        className="form-control"
                        value={invoiceForm.notes || ""}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-form-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="modal-form-section-title mb-1 pb-1">
                        Invoice Items
                      </div>
                      <span className="text-muted">
                        {invoiceForm.items.length} item(s)
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-primary-custom"
                      onClick={addItem}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="return-items-table edit-purchase-items-table">
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
                        {invoiceForm.items.map((item, index) => {
                          const subtotal =
                            Number(item.quantity || 0) *
                            Number(item.unit_cost || 0) *
                            Number(invoiceForm.conversion_factor || 1);

                          return (
                            <tr key={item.id || index}>
                              <td>
                                <input
                                  ref={(el) => (inputRefs.current[index] = el)}
                                  className="form-control"
                                  placeholder="Search product..."
                                  value={queries[index] ?? item.itemName ?? ""}
                                  onFocus={() => {
                                    setActiveIndex(index);
                                    updateDropdownPosition(index);
                                  }}
                                  onChange={(e) =>
                                    searchProducts(index, e.target.value)
                                  }
                                />
                              </td>

                              <td>{item.unit || "-"}</td>

                              <td>
                                <input
                                  type="number"
                                  className="form-control text-end"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "quantity",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  className="form-control text-end"
                                  value={item.unit_cost}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "unit_cost",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </td>

                              <td className="fw-bold">
                                ₱{subtotal.toLocaleString()}
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="btn-remove"
                                  onClick={() => removeItem(index)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-end mt-3">
                    <h5 className="fw-bold mb-0">
                      Grand Total: ₱{grandTotal.toLocaleString()}
                    </h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="app-modal-footer">
              <button
                type="button"
                className="btn-secondary-custom"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-primary-custom"
                onClick={onSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeIndex !== null && suggestions.length > 0 && dropdownPos && (
        <div
          className="modal-suggestions-floating"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {suggestions.map((product) => (
            <button
              type="button"
              key={product.id}
              className="modal-suggestion-floating-item"
              onMouseDown={() => selectProduct(product)}
            >
              <strong>{product.item_name}</strong>
              <span>
                {product.item_code} • {product.unit}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}