import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { IoChevronDown } from "react-icons/io5";
import "../../styles/modal.css";
import { showSuccessSwal, showErrorSwal } from "../../utils/swal";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_ITEMS = 16;

export default function EditOrderModal({ order, onClose, onSuccess }) {
  const inputRefs = useRef([]);

  const [customerID, setCustomerID] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [customerFocused, setCustomerFocused] = useState(false);

  const [items, setItems] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);

  const [saving, setSaving] = useState(false);
  const [itemLimitWarning, setItemLimitWarning] = useState(false);

  useEffect(() => {
    if (!order) return;

    setCustomerID(order.customer?.cid || order.customer?.id || "");
    setCustomerQuery(order.customer?.name || "");

    setItems(
      (order.items || []).map((item) => ({
        id: item.id,
        item_id: item.item_id || item.products?.id,
        products: item.products,
        quantity: item.quantity || 1,
        price: item.price || item.products?.price1 || 0,
        customPrice: item.price || "",
        customPriceEnabled: ![
          item.products?.price1,
          item.products?.price2,
          item.products?.price3,
          item.products?.price4,
        ].some((p) => Number(p) === Number(item.price)),
      }))
    );
  }, [order]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(Number(value || 0));

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.customPriceEnabled
        ? Number(item.customPrice || 0)
        : Number(item.price || 0);

      return sum + price * Number(item.quantity || 0);
    }, 0);
  }, [items]);

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
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

  const handleCustomerNameChange = async (e) => {
    const value = e.target.value;

    setCustomerQuery(value);
    setCustomerID("");

    if (!value.trim()) {
      setCustomerSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/customer`, {
        params: { search: value },
      });

      setCustomerSuggestions(res.data.data || []);
    } catch (err) {
      console.error("Customer search error:", err);
      setCustomerSuggestions([]);
    }
  };

  const selectCustomer = (customer) => {
    setCustomerID(customer.cid || customer.id);
    setCustomerQuery(customer.name);
    setCustomerSuggestions([]);
    setCustomerFocused(false);
  };

  const searchProducts = async (index, value) => {
    setActiveIndex(index);
    setProductQuery(value);
    updateDropdownPosition(index);

    updateItem(index, "products", {
      ...items[index].products,
      item_name: value,
    });

    if (!value.trim()) {
      setProductSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/product/search`, {
        params: {
          q: value,
          limit: 20,
        },
      });

      setProductSuggestions(res.data || []);
    } catch (err) {
      console.error("Product search error:", err);
      setProductSuggestions([]);
    }
  };

  const selectProduct = (product) => {
    if (activeIndex === null) return;

    const selectedProduct = {
      id: product.id || product.itemID,
      item_name: product.itemName || product.item_name,
      item_code: product.itemCode || product.item_code,
      stock: product.stock,
      price1: product.price1,
      price2: product.price2,
      price3: product.price3,
      price4: product.price4,
    };

    setItems((prev) =>
      prev.map((item, index) =>
        index === activeIndex
          ? {
              ...item,
              item_id: selectedProduct.id,
              products: selectedProduct,
              price: selectedProduct.price1 || 0,
              customPrice: "",
              customPriceEnabled: false,
            }
          : item
      )
    );

    setProductQuery("");
    setProductSuggestions([]);
    setActiveIndex(null);
    setDropdownPos(null);
  };

  const addItem = () => {
    if (items.length >= MAX_ITEMS) {
      setItemLimitWarning(true);
      return;
    }

    setItemLimitWarning(false);

    setItems((prev) => [
      ...prev,
      {
        item_id: null,
        products: null,
        quantity: 1,
        price: 0,
        customPrice: "",
        customPriceEnabled: false,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));

    setProductQuery("");
    setProductSuggestions([]);
    setActiveIndex(null);
    setDropdownPos(null);
  };

  const handleSave = async () => {
    const invalidItem = items.some(
      (item) => !item.item_id || Number(item.quantity) <= 0
    );

    if (!customerID) {
      showErrorSwal("Please select a customer.");
      return;
    }

    if (items.length === 0 || invalidItem) {
      showErrorSwal("Please complete all order items.");
      return;
    }

    try {
      setSaving(true);

      await axios.put(`${API_URL}/order/id/${order.id}`, {
        cid: customerID,
        order_date: order.order_date,
        discount: order.discount,
        items: items.map((item) => ({
          id: item.id,
          item_id: item.item_id,
          quantity: Number(item.quantity),
          price: item.customPriceEnabled
            ? Number(item.customPrice || 0)
            : Number(item.price || 0),
        })),
      });

      showSuccessSwal("Sales order updated successfully.");
      onSuccess?.();
    } catch (err) {
      console.error("Update order error:", err);
      showErrorSwal(
        err.response?.data?.message || "Failed to update sales order."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="app-modal-backdrop">
        <div className="app-modal">
          <div className="app-modal-content">
            <div className="app-modal-header">
              <div>
                <div className="app-modal-title">
                  Edit Order ORD{String(order.id).padStart(4, "0")}
                </div>
                <div className="app-modal-subtitle">
                  Update customer and ordered items
                </div>
              </div>

              <button type="button" className="app-modal-close" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="app-modal-body">
              <div className="modal-form-section">
                <div className="modal-form-section-title">Customer Details</div>

                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label">ID</label>
                    <input className="form-control" value={customerID} disabled />
                  </div>

                  <div className="col-md-6 position-relative">
                    <label className="form-label">Customer</label>
                    <input
                      className="form-control"
                      value={customerQuery}
                      onChange={handleCustomerNameChange}
                      onFocus={() => setCustomerFocused(true)}
                      onBlur={() =>
                        setTimeout(() => {
                          setCustomerFocused(false);
                          setCustomerSuggestions([]);
                        }, 150)
                      }
                      placeholder="Search customer..."
                    />

                    {customerFocused && customerSuggestions.length > 0 && (
                      <ul className="modal-suggestions">
                        {customerSuggestions.map((customer) => (
                          <li
                            key={customer.id || customer.cid}
                            onMouseDown={() => selectCustomer(customer)}
                          >
                            {customer.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-form-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="modal-form-section-title mb-1 pb-1">
                      Ordered Items
                    </div>
                    <span className="text-muted">{items.length} item(s)</span>
                  </div>

                  <button
                    type="button"
                    className="btn-primary-custom"
                    onClick={addItem}
                    disabled={items.length >= MAX_ITEMS}
                  >
                    + Add Item
                  </button>
                </div>

                {itemLimitWarning && (
                  <div className="alert alert-warning py-2">
                    Maximum of {MAX_ITEMS} items only.
                  </div>
                )}

                <div style={{ maxHeight: "430px", overflowY: "auto" }}>
                  {items.map((item, index) => {
                    const price = item.customPriceEnabled
                      ? Number(item.customPrice || 0)
                      : Number(item.price || 0);

                    const subtotal = price * Number(item.quantity || 0);

                    return (
                      <div
                        key={item.id || index}
                        className="d-flex gap-2 align-items-center mb-2"
                      >
                        <div className="flex-grow-1">
                          <input
                            ref={(el) => (inputRefs.current[index] = el)}
                            className="form-control"
                            value={
                              activeIndex === index
                                ? productQuery
                                : item.products?.item_name || ""
                            }
                            onFocus={() => {
                              setActiveIndex(index);
                              updateDropdownPosition(index);
                            }}
                            onChange={(e) =>
                              searchProducts(index, e.target.value)
                            }
                            placeholder="Search item..."
                          />
                        </div>

                        <input
                          type="number"
                          className="form-control"
                          style={{ width: "85px" }}
                          value={item.quantity}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                        />

                        {item.customPriceEnabled ? (
                          <div className="input-group" style={{ width: "135px" }}>
                            <input
                              type="number"
                              className="form-control"
                              value={item.customPrice || ""}
                              onWheel={(e) => e.target.blur()}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "customPrice",
                                  e.target.value
                                )
                              }
                              placeholder="Price"
                            />

                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                updateItem(
                                  index,
                                  "customPriceEnabled",
                                  false
                                )
                              }
                            >
                              <IoChevronDown />
                            </button>
                          </div>
                        ) : (
                          <select
                            className="form-select"
                            style={{ width: "135px" }}
                            value={item.price ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value === "custom") {
                                updateItem(index, "customPriceEnabled", true);
                                updateItem(
                                  index,
                                  "customPrice",
                                  item.price || ""
                                );
                              } else {
                                updateItem(index, "price", Number(value));
                              }
                            }}
                          >
                            {[
                              item.products?.price1,
                              item.products?.price2,
                              item.products?.price3,
                              item.products?.price4,
                            ]
                              .filter((price) => price != null)
                              .map((price, priceIndex) => (
                                <option key={priceIndex} value={price}>
                                  ₱{Number(price).toLocaleString()}
                                </option>
                              ))}

                            <option value="custom">Custom...</option>
                          </select>
                        )}

                        <div
                          className="text-end fw-semibold"
                          style={{ width: "120px" }}
                        >
                          {formatCurrency(subtotal)}
                        </div>

                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="app-modal-footer">
              <div className="fw-semibold fs-5">
                Total: {formatCurrency(total)}
              </div>

              <div className="d-flex gap-2">
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
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeIndex !== null && productSuggestions.length > 0 && dropdownPos && (
        <div
          className="modal-suggestions-floating"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {productSuggestions.map((product) => (
            <button
              type="button"
              key={product.id || product.itemID}
              className="modal-suggestion-floating-item"
              onMouseDown={() => selectProduct(product)}
            >
              <strong>{product.itemName || product.item_name}</strong>
              <span>Stock: {product.stock ?? 0}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}