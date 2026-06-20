import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./CreatePurchase.css";

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
  });

  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [items, setItems] = useState([{ ...emptyItem }]);
  const [queries, setQueries] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const [saving, setSaving] = useState(false);

  const total = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
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

  const handleSearchChange = async (index, value) => {
    setQueries((prev) => ({
      ...prev,
      [index]: value,
    }));

    setItems((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        product_id: null,
        item_name: value,
        item_code: "",
        unit: "",
      };

      return updated;
    });

    if (!value.trim()) {
      setSuggestions((prev) => ({
        ...prev,
        [index]: [],
      }));
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/product/search`, {
        params: {
          q: value,
          limit: 20,
        },
      });

      setSuggestions((prev) => ({
        ...prev,
        [index]: res.data || [],
      }));
    } catch (err) {
      console.error(err);
      setSuggestions((prev) => ({
        ...prev,
        [index]: [],
      }));
    }
  };

  const handleSelectProduct = (index, product) => {
    const duplicate = items.some(
      (item, i) => i !== index && item.product_id === product.id
    );

    if (duplicate) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Product",
        text: `${product.item_name} is already added.`,
        confirmButtonColor: "#1E5A84",
      });
      return;
    }

    setItems((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        product_id: product.id,
        item_name: product.item_name,
        item_code: product.item_code,
        unit: product.unit,
      };

      return updated;
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

  const validateForm = () => {
    if (!form.supplier_id) return "Please select a supplier from the list.";
    if (!form.po_number.trim()) return "PO number is required.";
    if (!form.invoice_number.trim()) return "Invoice number is required.";
    if (!form.purchase_date) return "Purchase date is required.";

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
    };
  
    console.log(payload);

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
    <div className="create-purchase-page">
      <div className="create-purchase-card">
        <div className="create-purchase-header">
          <div>
            <h1>Create Purchase</h1>
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
                  onChange={(e) =>
                    handleSupplierSearch(e.target.value)
                  }
                />

                {supplierSuggestions.length > 0 && (
                  <ul className="supplier-suggestions">
                    {supplierSuggestions.map((supplier) => (
                      <li
                        key={supplier.id}
                        onMouseDown={() =>
                          handleSelectSupplier(supplier)
                        }
                      >
                        <strong>{supplier.name}</strong>

                        <span>
                          {supplier.sid}
                        </span>
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
          <div className="products-header">
            <h5>Products</h5>

            <button className="btn add-row-btn" onClick={addItem}>
              + Add Product
            </button>
          </div>

          <div className="table-responsive">
            <table className="table purchase-table align-middle">
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
                    <td className="product-cell">
                      <input
                        className="form-control"
                        value={queries[index] ?? item.item_name}
                        onChange={(e) =>
                          handleSearchChange(index, e.target.value)
                        }
                        placeholder="Search product..."
                      />

                      {suggestions[index]?.length > 0 && (
                        <ul className="product-suggestions">
                          {suggestions[index].map((product) => (
                            <li
                              key={product.id}
                              onClick={() =>
                                handleSelectProduct(index, product)
                              }
                            >
                              <strong>{product.item_name}</strong>
                              <span>{product.item_code}</span>
                            </li>
                          ))}
                        </ul>
                      )}
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
                        className="btn btn-sm btn-danger"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        -
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="purchase-total">
            <span>Total</span>
            <strong>
              {formatCurrency(total)}
            </strong>
          </div>
        </div>

        <div className="create-actions">
          <button
            className="btn purchase-secondary-btn"
            onClick={() => navigate("/purchase")}
          >
            Cancel
          </button>

          <button
            className="btn save-purchase-btn"
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