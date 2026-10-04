import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./CreatePurchase.css";
import "../../styles/create-page.css"
import { debug } from "../../utils/log";

const formatCurrency = (value) => Number(value).toLocaleString("en-PH", { style: "currency", currency: "PHP", });
const API_URL = import.meta.env.VITE_API_URL;

const emptyItem = {
  product_id: null,
  item_name: "",
  item_code: "",
  unit: "",
  quantity: 1,
  unit_cost: 0,
  subtotal: 0,
  notes: "",
};

export default function CreatePurchase() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    supplier_id: null,
    supplier_name: "",
    po_number: "",
    invoice_number: "",
    purchase_date: new Date().toISOString().split("T")[0],
    conversion_factor: 1,
    notes: "",
  });

  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [items, setItems] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const total = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

  const normalizeCode = (value) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  const partNumberKey = (product) => {
    if (product.part_num) return normalizeCode(product.part_num);
    if (!product.item_code) return null;
    return normalizeCode(product.item_code).replace(/[a-z]+$/, "");
  };

  const BRAND_COLORS = [
    { bg: "#dbeafe", text: "#1e40af" },
    { bg: "#dcfce7", text: "#166534" },
    { bg: "#fce7f3", text: "#9d174d" },
    { bg: "#ede9fe", text: "#5b21b6" },
    { bg: "#ffedd5", text: "#9a3412" },
    { bg: "#cffafe", text: "#155e75" },
  ];

  const brandColor = (brand) => {
    let hash = 0;
    for (let i = 0; i < brand.length; i++) hash = (hash * 31 + brand.charCodeAt(i)) >>> 0;
    return BRAND_COLORS[hash % BRAND_COLORS.length];
  };

  const partNumberCounts = productSuggestions.reduce((counts, product) => {
    const key = partNumberKey(product);
    if (key) counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const hasAmbiguousMatches = Object.values(partNumberCounts).some(
    (count) => count > 1
  );

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      const qty = Number(updated[index].quantity || 0);
      const cost = Number(updated[index].unit_cost || 0);

      updated[index].subtotal = qty * cost;

      return updated;
    });
  };

  const handleSupplierSearch = async (value) => {
    setSupplierQuery(value);
  
    updateForm("supplier_name", value);
  
    if (!value.trim()) {
      setSupplierSuggestions([]);
      return;
    }
  
    try {
      const res = await axios.get( `${API_URL}/supplier`, { params: { search: value, limit: 20 }, } );
      setSupplierSuggestions(res.data.data || []);
    } catch (err) {
      console.error(err);
      setSupplierSuggestions([]);
    }
  };

  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierQuery(supplier.name);
    updateForm("supplier_id", supplier.id);
    updateForm("supplier_name", supplier.name);
    setSupplierSuggestions([]);
  };

  const handleSearchChange = async (value) => {
    setProductQuery(value);

    if (!value.trim()) {
      setProductSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/product/search`, {
        params: {
          q: value,
          limit: 20,
          status: "active", // only active products can be purchased
        },
      });

      setProductSuggestions(res.data || []);
    } catch (err) {
      console.error(err);
      setProductSuggestions([]);
    }
  };

  const handleSelectProduct = (product) => {
    const duplicate = items.some((item) => item.product_id === product.id);

    if (duplicate) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Product",
        text: `${product.item_name} is already added.`,
        confirmButtonColor: "#1E5A84",
      });
      setProductQuery("");
      setProductSuggestions([]);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        ...emptyItem,
        product_id: product.id,
        item_name: product.item_name,
        item_code: product.item_code,
        unit: product.unit,
      },
    ]);

    setProductQuery("");
    setProductSuggestions([]);
  };

  const validateForm = () => {
    if (!form.supplier_id) return "Please select a supplier from the list.";
    if (!form.po_number.trim()) return "PO number is required.";
    if (!form.invoice_number.trim()) return "Invoice number is required.";
    if (!form.purchase_date) return "Purchase date is required.";
    if (items.length === 0) return "Please add at least one product.";

    const invalidItem = items.find(
      (item) =>
        !item.product_id ||
        Number(item.quantity) <= 0 ||
        Number(item.unit_cost) <= 0
    );

    if (invalidItem) {
      return "Please select a product and enter valid quantity/unit cost.";
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();

    if (error) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: error,
        confirmButtonColor: "#1E5A84",
      });
      return;
    }

    const payload = {
      invoice_number: form.invoice_number,
      po_number: form.po_number,
      purchase_date: form.purchase_date,
      supplier_id: Number(form.supplier_id),
      conversion_factor: Number(form.conversion_factor || 1),
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost),
      })),
      notes: form.notes,
    };
  
    debug(payload);

    try {
      setSaving(true);
  
      await axios.post(`${API_URL}/supplier-invoice`, payload);
  
      Swal.fire({
        icon: "success",
        title: "Purchase Created",
        text: "The purchase invoice has been saved.",
        confirmButtonColor: "#1E5A84",
      });
  
      navigate("/purchase");
    } catch (err) {
      console.error(err);
  
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          err.response?.data?.message ||
          "Something went wrong while saving the purchase.",
        confirmButtonColor: "#1E5A84",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-card">
        <div className="create-header">
          <div>
            <h1>Create Purchase</h1>
            <p>Create a new purchase order and add supplier details.</p>
          </div>
        </div>
  
        <div className="create-section">
          <h5>Purchase Information</h5>
  
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Supplier Name</label>
  
              <div className="supplier-search">
                <input
                  className="form-control"
                  placeholder="Search supplier..."
                  value={supplierQuery}
                  onChange={(e) => handleSupplierSearch(e.target.value)}
                />
  
                {supplierSuggestions.length > 0 && (
                  <ul className="supplier-suggestions">
                    {supplierSuggestions.map((supplier) => (
                      <li
                        key={supplier.id}
                        onMouseDown={() => handleSelectSupplier(supplier)}
                      >
                        <strong>{supplier.name}</strong>
                        <span>{supplier.sid}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
  
            <div className="col-md-2">
              <label className="form-label">PO Number</label>
              <input
                className="form-control"
                value={form.po_number}
                onChange={(e) => updateForm("po_number", e.target.value)}
                placeholder="Input P.O. number"
              />
            </div>
  
            <div className="col-md-2">
              <label className="form-label">Invoice Number</label>
              <input
                className="form-control"
                value={form.invoice_number}
                onChange={(e) => updateForm("invoice_number", e.target.value)}
                placeholder="Input Invoice Number"
              />
            </div>
  
            <div className="col-md-2">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                className="form-control"
                value={form.purchase_date}
                onChange={(e) => updateForm("purchase_date", e.target.value)}
              />
            </div>
  
            <div className="col-md-2">
              <label className="form-label">Conversion Factor</label>
              <input
                type="number"
                className="form-control"
                value={form.conversion_factor}
                onChange={(e) =>
                  updateForm("conversion_factor", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="create-section">
          <div className="row">
            <div className="col-12">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows={5}
                value={form.notes || ""}
                onChange={(e) => updateForm("notes", e.target.value)}
                placeholder="Input any additional information here"
              />
            </div>
          </div>
        </div>
  
        <div className="create-section">
          <div className="create-section-header">
            <h5>Products</h5>
            <span className="text-muted">
              {items.length} item{items.length === 1 ? "" : "s"} encoded
            </span>
          </div>

          <div className="product-cell" style={{ marginBottom: "16px" }}>
            <input
              className="form-control"
              value={productQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search product..."
            />

            {productSuggestions.length > 0 && (
              <div className="product-suggestions-panel">
                {hasAmbiguousMatches && (
                  <div className="product-suggestions-warning">
                    ⚠ Multiple items share this part number — check the brand/code before selecting.
                  </div>
                )}

                <ul className="product-suggestions">
                  {productSuggestions.map((product) => {
                    const key = partNumberKey(product);
                    const isAmbiguous = key && partNumberCounts[key] > 1;

                    const color = product.brand ? brandColor(product.brand) : null;

                    return (
                      <li
                        key={product.id}
                        className={isAmbiguous ? "is-ambiguous" : undefined}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="suggestion-row">
                          <div className="suggestion-text">
                            <strong>{product.item_name}</strong>
                            <span>{product.item_code}</span>
                          </div>

                          {product.brand && (
                            <span
                              className="brand-pill"
                              style={{ backgroundColor: color.bg, color: color.text }}
                            >
                              {product.brand}
                            </span>
                          )}
                        </div>

                        {isAmbiguous && (
                          <span className="ambiguous-badge">⚠ multiple matches — check brand</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="table-responsive">
            <table className="table create-table align-middle">
              <thead>
                <tr>
                  <th>Product</th>
                  <th width="110">Qty</th>
                  <th width="150">Unit Cost</th>
                  <th width="100">Unit</th>
                  <th width="150">Subtotal</th>
                  <th width="80">Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="fw-semibold">{item.item_name}</div>
                      <small className="text-muted">{item.item_code}</small>
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                      />
                    </td>
  
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.unit_cost}
                        onChange={(e) =>
                          updateItem(index, "unit_cost", e.target.value)
                        }
                      />
                    </td>
  
                    <td>
                      <input
                        className="form-control"
                        value={item.unit || ""}
                        disabled
                      />
                    </td>
  
                    <td>
                      <input
                        className="form-control"
                        value={formatCurrency(item.subtotal)}
                        disabled
                      />
                    </td>
  
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeItem(index)}
                      >
                        -
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          <div className="create-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>
  
        <div className="create-actions">
          <button
            type="button"
            className="btn create-secondary-btn"
            onClick={() => navigate("/purchase")}
          >
            Cancel
          </button>
  
          <button
            type="button"
            className="btn create-primary-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
}