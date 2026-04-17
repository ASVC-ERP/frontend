import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import showAlert from "../../Swal";
import "./ItemDetails.css"

function ItemDetails({ item, onUpdate }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockData, setStockData] = useState();
  const [itemData, setItemData] = useState(item);

  /* USE EFFECTS */
  useEffect(() => {
    onUpdate?.();
  }, []);

  useEffect(() => {
    setItemData(item);
    setFormData(normalizeItem(item));
  }, [item]);

  const normalizeItem = (item = {}) => ({
    id: item.itemID ?? item.id,
    itemCode: item.itemCode ?? item.item_code ?? "",
    itemName: item.itemName ?? item.item_name ?? "",
    partNum: item.partNum ?? item.part_num ?? "",
    interNum: item.interNum ?? item.internal_num ?? "",
    unit: item.unit ?? "",
    minStock: item.minStock ?? item.min_stock ?? "",
    origin: item.origin ?? "",
    model: item.model ?? "",
    brand: item.brand ?? "",
  });

  const [formData, setFormData] = useState(() => 
    item ? normalizeItem(item) : {}
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    Swal.fire({
      title: "Saving changes",
      text: "Please wait while we save your changes...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (!formData.id) {
        console.error("Missing item ID");
        return;
      }

      const response = await fetch(`${API_URL}/product/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_code: formData.itemCode,
          item_name: formData.itemName,
          brand: formData.brand,
          min_stock: Number(formData.minStock),
          part_num: formData.partNum,
          internal_num: formData.interNum,
          unit: formData.unit,
          model: formData.model,
          origin: formData.origin,
        }),
      });

      if (response.ok) {
        Swal.fire({
          text: "Item updated successfully!",
          icon: "success",
          confirmButtonColor: "#1E5A84",
        });

        const updatedItem = {
          ...item,
          itemCode: formData.itemCode,
          itemName: formData.itemName,
          brand: formData.brand,
          minStock: Number(formData.minStock),
          partNum: formData.partNum,
          interNum: formData.interNum,
          unit: formData.unit,
          model: formData.model,
          origin: formData.origin,
        };
        setItemData(updatedItem);
        setFormData(normalizeItem(updatedItem));

        if (onUpdate) {
          onUpdate();
        }
      } else {
        Swal.fire({
          text: "Failed to update item.",
          icon: "error",
          confirmButtonColor: "#1E5A84",
        });
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleStockUpdate = async () => {
    Swal.fire({
      title: "Updating Stock",
      text: "Please wait while we update the stock...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const PIC = user?.userId;
    const payload = {
      quantity: Number(stockData.newCount),
      remarks: stockData.remarks,
      pic: Number(PIC),
    };

    try {
      const response = await axios.patch(
        `${API_URL}/product/${item.itemID || item.id}/stock`,
        payload
      );

      console.log("Stock adjusted successfully:", response.data);
      Swal.fire({
        text: "Stock updated successfully!",
        icon: "success",
        confirmButtonColor: "#1E5A84",
      });
      setShowStockModal(false);

      setItemData((prev) => ({ ...prev, stock: Number(stockData.newCount) }));

      setStockData((prev) => ({
        ...prev,
        currentCount: Number(stockData.newCount),
        newCount: "",
        remarks: "",
      }));

      if (onUpdate) {
        if (onUpdate) onUpdate({ ...item, stock: stockData.newCount });
      }
    } catch (err) {
      console.error("Stock adjustment error:", err);

      Swal.fire({
        text: err,
        icon: "error",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const handleEditStockClick = () => {
    setStockData({
      currentCount: itemData.stock,
      newCount: "",
      remarks: "",
    });
    setShowStockModal(true);
  };

  const [showEditSpecialPriceModal, setShowEditSpecialPriceModal] = useState(false);
  const [currentSpecialPrice, setCurrentSpecialPrice] = useState("");
  const [newSpecialPrice, setNewSpecialPrice] = useState("");

  const handleEditSpecialPriceClick = () => {
    setCurrentSpecialPrice(itemData.price4); // use latest value
    setNewSpecialPrice(itemData.price4);
    setShowEditSpecialPriceModal(true);
  };

  const handleCloseSpecialPriceModal = () => {
    setShowEditSpecialPriceModal(false);
    setCurrentSpecialPrice("");
    setNewSpecialPrice("");
  };

  const handleSubmitSpecialPrice = async () => {
    if (!newSpecialPrice) return;

    Swal.fire({
      title: "Updating Special Price",
      text: "Please wait while we update the special price...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.patch(
        `${API_URL}/product/${item.itemID || item.id}/price`,
        {
          price4: Number(newSpecialPrice),
        },
      );

      console.log("Price 4 updated successfully:", response.data);
      showAlert("success", "Price 4 updated successfully!");
      handleCloseSpecialPriceModal();

      setCurrentSpecialPrice(Number(newSpecialPrice));
      setItemData((prev) => ({ ...prev, price4: Number(newSpecialPrice) }));
      setNewSpecialPrice(Number(newSpecialPrice));

      if (onUpdate)
        onUpdate({
          ...item,
          price: { ...item.price, price4: newSpecialPrice },
        });
    } catch (err) {
      console.error("Price 4 update error:", err);
      Swal.fire({
        text: "Error updating Price 4.",
        icon: "error",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const [showEditCostModal, setShowEditCostModal] = useState(false);
  const [currentCost, setCurrentCost] = useState("");
  const [newCost, setNewCost] = useState("");

  const handleEditCostClick = () => {
    setCurrentCost(itemData.cost);
    setNewCost("");
    setShowEditCostModal(true);
  };

  const handleCloseCostModal = () => {
    setShowEditCostModal(false);
    setCurrentCost("");
    setNewCost("");
  };

  const handleSubmitCost = async () => {
    if (!newCost) return;

    Swal.fire({
      title: "Updating Cost",
      text: "Please wait while we update the cost...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.patch(
        `${API_URL}/product/${item.itemID || item.id}/cost`,
        {
          cost: Number(newCost),
        },
      );

      console.log("Cost updated successfully:", response.data);
      showAlert("success", "Cost updated successfully!");
      handleCloseCostModal();

      setCurrentCost(Number(newCost));
      setItemData((prev) => ({ ...prev, cost: Number(newCost) }));
      setNewCost(Number(newCost));

      if (onUpdate)
        onUpdate({
          ...item,
          cost: { ...item.cost, cost: newCost },
        });
    } catch (err) {
      console.error("Cost update error:", err);
      Swal.fire({
        text: "Error updating Cost.",
        icon: "error",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  return (
    <div className="product-details">
      <div className="pd-card">
        <div className="header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="section-title">Product Details</span>
            <span className="code-chip">{itemData.itemCode || itemData.item_code}</span>
          </div>
          {isAdmin && (
            <button className="save-btn" onClick={handleSave}>Save changes</button>
          )}
        </div>
        <div className="divider" />

        <div className="pd-grid grid-top">
          <div className="field-group">
            <span className="field-label">Product code</span>
            <input className="field-input" readOnly value={itemData.itemCode || itemData.item_code} />
          </div>
          <div className="field-group">
            <span className="field-label">Product name</span>
            <input
              className="field-input"
              id="itemName"
              value={formData.itemName || formData.item_name}
              onChange={handleChange}
              readOnly={!isAdmin}
            />
          </div>
          <div className="field-group">
            <span className="field-label">Unit</span>
            <input
              className="field-input"
              id="unit"
              value={formData.unit}
              onChange={handleChange}
              readOnly={!isAdmin}
            />
          </div>
        </div>
      </div>
      <div className="pd-card">
        <div className="section-header">
          <span className="section-title">Metadata</span>
        </div>
        <div className="divider" />
        <div className="pd-grid grid-meta">
          {[
            { label: 'Part no.',        id: 'partNum',  value: formData.partNum  || formData.part_num },
            { label: 'Model',           id: 'model',    value: formData.model },
            { label: 'Interchange no.', id: 'interNum', value: formData.interNum || formData.internal_num },
            { label: 'Brand',           id: 'brand',    value: formData.brand },
            { label: 'Origin',          id: 'origin',   value: formData.origin },
            { label: 'Min. stock',      id: 'minStock', value: formData.minStock || formData.min_stock },
          ].map(({ label, id, value }) => (
            <div className="field-group" key={id}>
              <span className="field-label">{label}</span>
              <input
                className="field-input"
                id={id}
                value={value}
                onChange={handleChange}
                readOnly={!isAdmin}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pd-card">
        <div className="section-header">
          <span className="section-title">Pricing & Inventory</span>
        </div>
        <div className="divider" />
        <div className="pd-grid grid-pricing">
          <div className="price-card">
            <span className="price-label">Cost</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="price-value">₱ {itemData.cost}</span>
              {user?.role === 'admin' && (
                <button className="edit-btn-sm" onClick={() => handleEditCostClick(item.cost)}>
                  <FaEdit size={15} />
                </button>
              )}
            </div>
          </div>

          {[
            { label: 'Price 1', value: itemData.price1 },
            { label: 'Price 2', value: itemData.price2 },
            { label: 'Price 3', value: itemData.price3 },
          ].map(({ label, value }) => (
            <div className="price-card" key={label}>
              <span className="price-label">{label}</span>
              <span className="price-value">₱ {value}</span>
            </div>
          ))}

          <div className="price-card">
            <span className="price-label">Price 4</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="price-value">₱ {itemData.price4}</span>
              {user?.role === 'admin' && (
                <button className="edit-btn-sm" onClick={() => handleEditSpecialPriceClick(item.price4)}>
                  <FaEdit size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="price-card price-card--stock">
            <span className="price-label" style={{ color: 'var(--color-text-info)' }}>Stock</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="price-value" style={{ color: 'var(--color-text-info)' }}>
                {itemData.stock} {itemData.unit}/s
              </span>
              <button className="edit-btn-sm" onClick={handleEditStockClick}>
                <FaEdit size={15} />
              </button>
            </div>
            <span
              className={`stock-badge ${
                itemData.stock === 0
                  ? "stock-badge--danger"
                  : itemData.stock <= ( itemData.minStock || itemData.min_stock )
                  ? "stock-badge--warning"
                  : ""
              }`}
            >
              {itemData.stock === 0
                ? "❌ Out of stock"
                : itemData.stock <= ( itemData.minStock || itemData.min_stock )
                ? "⚠️ Low stock"
                : "✔ In stock"}
            </span>
          </div>
        </div>
      </div>

      {showStockModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg w-50"
            role="document"
          >
            <div className="modal-content shadow-lg border-0">
              {/* Header with gradient background */}
              <div
                className="modal-header text-white position-relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
              >
                <div className="d-flex align-items-center">
                  <div>
                    <h5 className="modal-title mb-0">Update Stock Count</h5>
                    <small className="opacity-75">
                      Modify inventory stock levels
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white p-4"
                  onClick={() => setShowStockModal(false)}
                  aria-label="Close"
                ></button>

                {/* Decorative elements */}
                <div
                  className="position-absolute"
                  style={{
                    top: "-50px",
                    right: "-50px",
                    width: "100px",
                    height: "100px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                  }}
                ></div>
                <div
                  className="position-absolute"
                  style={{
                    bottom: "-30px",
                    left: "-30px",
                    width: "60px",
                    height: "60px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "50%",
                  }}
                ></div>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  {/* Current Stock (Read-only) */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-boxes me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Current Stock Count
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Current Stock"
                      value={stockData.currentCount}
                      disabled
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        fontWeight: "500",
                      }}
                    />
                  </div>

                  {/* New Stock Count */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-edit me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      New Stock Count
                    </label>
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      className="form-control"
                      placeholder="Enter new stock count"
                      value={stockData.newCount}
                      onChange={(e) =>
                        setStockData({ ...stockData, newCount: e.target.value })
                      }
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  {/* Remarks/Reason */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-comment-alt me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Reason for Stock Change{" "}
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Enter reason for stock change (e.g., damaged goods, recount, sales adjustment, etc.)"
                      value={stockData.remarks}
                      onChange={(e) =>
                        setStockData({ ...stockData, remarks: e.target.value })
                      }
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        resize: "vertical",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>
                </div>

                {/* Stock Difference Indicator */}
                {stockData.newCount && stockData.currentCount && (
                  <div
                    className="mt-4 p-3 rounded-3"
                    style={{
                      backgroundColor:
                        parseInt(stockData.newCount) >
                        parseInt(stockData.currentCount)
                          ? "rgba(25, 135, 84, 0.1)"
                          : parseInt(stockData.newCount) <
                              parseInt(stockData.currentCount)
                            ? "rgba(220, 53, 69, 0.1)"
                            : "rgba(12, 29, 97, 0.05)",
                      border: `1px solid ${
                        parseInt(stockData.newCount) >
                        parseInt(stockData.currentCount)
                          ? "rgba(25, 135, 84, 0.2)"
                          : parseInt(stockData.newCount) <
                              parseInt(stockData.currentCount)
                            ? "rgba(220, 53, 69, 0.2)"
                            : "rgba(12, 29, 97, 0.1)"
                      }`,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <i
                        className={`fas ${
                          parseInt(stockData.newCount) >
                          parseInt(stockData.currentCount)
                            ? "fa-arrow-up text-success"
                            : parseInt(stockData.newCount) <
                                parseInt(stockData.currentCount)
                              ? "fa-arrow-down text-danger"
                              : "fa-equals"
                        } me-2`}
                      ></i>
                      <small className="text-muted">
                        <strong>Stock Change: </strong>
                        {parseInt(stockData.newCount) -
                          parseInt(stockData.currentCount) >
                        0
                          ? "+"
                          : ""}
                        {parseInt(stockData.newCount) -
                          parseInt(stockData.currentCount)}{" "}
                        units
                        {parseInt(stockData.newCount) >
                          parseInt(stockData.currentCount) &&
                          " (Stock Increase)"}
                        {parseInt(stockData.newCount) <
                          parseInt(stockData.currentCount) &&
                          " (Stock Decrease)"}
                        {parseInt(stockData.newCount) ===
                          parseInt(stockData.currentCount) && " (No Change)"}
                      </small>
                    </div>
                  </div>
                )}

                {/* Info card */}
                <div
                  className="mt-3 p-3 rounded-3"
                  style={{
                    backgroundColor: "rgba(12, 29, 97, 0.05)",
                    border: "1px solid rgba(12, 29, 97, 0.1)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className="fas fa-info-circle me-2"
                      style={{ color: "#1E5A84" }}
                    ></i>
                    <small className="text-muted">
                      Stock updates will be logged with timestamp and user
                      information for audit purposes.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-0 rounded-bottom">
                <button
                  type="button"
                  className="btn px-4 py-2 me-2"
                  onClick={() => setShowStockModal(false)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#c82333";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#dc3545";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn px-4 py-2"
                  onClick={handleStockUpdate}
                  disabled={!stockData.newCount || !stockData.remarks}
                  style={{
                    backgroundColor:
                      !stockData.newCount || !stockData.remarks
                        ? "#6c757d"
                        : "#1E5A84",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    cursor:
                      !stockData.newCount || !stockData.remarks
                        ? "not-allowed"
                        : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (stockData.newCount && stockData.remarks) {
                      e.target.style.backgroundColor = "#1e3c72";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (stockData.newCount && stockData.remarks) {
                      e.target.style.backgroundColor = "#1E5A84";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <i className="fas fa-save me-2"></i>
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Special Price Modal */}
      {showEditSpecialPriceModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg w-50"
            role="document"
          >
            <div className="modal-content shadow-lg border-0">
              {/* Header with gradient background */}
              <div
                className="modal-header text-white position-relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
              >
                <div className="d-flex align-items-center">
                  <div>
                    <h5 className="modal-title mb-0">Edit Price 4</h5>
                    <small className="opacity-75">
                      Modify pricing 4 for item
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white p-4"
                  onClick={handleCloseSpecialPriceModal}
                  aria-label="Close"
                ></button>

                {/* Decorative elements */}
                <div
                  className="position-absolute"
                  style={{
                    top: "-50px",
                    right: "-50px",
                    width: "100px",
                    height: "100px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                  }}
                ></div>
                <div
                  className="position-absolute"
                  style={{
                    bottom: "-30px",
                    left: "-30px",
                    width: "60px",
                    height: "60px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "50%",
                  }}
                ></div>
              </div>

              <div className="modal-body p-4">
                <form>
                  <div className="row g-3">
                    {/* Current Special Price (Read-only) */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted small">
                        <i
                          className="fas fa-tag me-2"
                          style={{ color: "#1E5A84" }}
                        ></i>
                        Current Price 4
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            backgroundColor: "#f8f9fa",
                            color: "#495057",
                          }}
                        >
                          ₱
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={currentSpecialPrice}
                          disabled
                          style={{
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            fontSize: "0.95rem",
                            fontWeight: "500",
                          }}
                        />
                      </div>
                    </div>

                    {/* New Special Price */}
                    <div className="col-12">
                      <label
                        htmlFor="newSpecialPrice"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-star me-2"
                          style={{ color: "#1E5A84" }}
                        ></i>
                        New Price 4
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#fff", color: "#495057" }}
                        >
                          ₱
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          id="newSpecialPrice"
                          className="form-control"
                          placeholder="0.00"
                          value={newSpecialPrice}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => setNewSpecialPrice(e.target.value)}
                          style={{
                            border: "1px solid #e9ecef",
                            fontSize: "0.95rem",
                            transition: "border-color 0.3s ease",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#1E5A84")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "#e9ecef")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </form>

                {/* Price Change Indicator */}
                { currentSpecialPrice !== null &&
                  currentSpecialPrice !== undefined &&
                  newSpecialPrice !== null &&
                  newSpecialPrice !== undefined &&
                  currentSpecialPrice !== newSpecialPrice && (
                    <div
                      className="mt-4 p-3 rounded-3"
                      style={{
                        backgroundColor:
                          parseFloat(newSpecialPrice) <
                          parseFloat(currentSpecialPrice)
                            ? "rgba(25, 135, 84, 0.1)"
                            : parseFloat(newSpecialPrice) >
                                parseFloat(currentSpecialPrice)
                              ? "rgba(255, 193, 7, 0.1)"
                              : "rgba(12, 29, 97, 0.05)",
                        border: `1px solid ${
                          parseFloat(newSpecialPrice) <
                          parseFloat(currentSpecialPrice)
                            ? "rgba(25, 135, 84, 0.2)"
                            : parseFloat(newSpecialPrice) >
                                parseFloat(currentSpecialPrice)
                              ? "rgba(255, 193, 7, 0.2)"
                              : "rgba(12, 29, 97, 0.1)"
                        }`,
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i
                          className={`fas ${
                            parseFloat(newSpecialPrice) <
                            parseFloat(currentSpecialPrice)
                              ? "fa-arrow-down text-success"
                              : parseFloat(newSpecialPrice) >
                                  parseFloat(currentSpecialPrice)
                                ? "fa-arrow-up text-warning"
                                : "fa-equals text-secondary"
                          } me-2`}
                        ></i>
                        <small className="text-muted">
                          <strong>Price Change: </strong>
                          {parseFloat(newSpecialPrice) >
                          parseFloat(currentSpecialPrice)
                            ? "+"
                            : ""}
                          ₱
                          {(
                            parseFloat(newSpecialPrice) -
                            parseFloat(currentSpecialPrice)
                          ).toFixed(2)}
                          {parseFloat(newSpecialPrice) <
                            parseFloat(currentSpecialPrice) &&
                            " (Price Decrease)"}
                          {parseFloat(newSpecialPrice) >
                            parseFloat(currentSpecialPrice) &&
                            " (Price Increase)"}
                        </small>
                      </div>
                    </div>
                  )}

                {/* Info card */}
                <div
                  className="mt-4 p-3 rounded-3"
                  style={{
                    backgroundColor: "rgba(12, 29, 97, 0.05)",
                    border: "1px solid rgba(12, 29, 97, 0.1)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className="fas fa-info-circle me-2"
                      style={{ color: "#1E5A84" }}
                    ></i>
                    <small className="text-muted">
                      Changes will be applied immediately. Make sure the new
                      price is accurate before saving.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-0 rounded-bottom">
                <button
                  type="button"
                  className="btn px-4 py-2 me-2"
                  onClick={() => setShowEditSpecialPriceModal(false)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#c82333";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#dc3545";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn px-4 py-2"
                  onClick={handleSubmitSpecialPrice}
                  disabled={!newSpecialPrice}
                  style={{
                    backgroundColor: !newSpecialPrice ? "#6c757d" : "#1E5A84",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    cursor: !newSpecialPrice ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (newSpecialPrice) {
                      e.target.style.backgroundColor = "#1e3c72";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newSpecialPrice) {
                      e.target.style.backgroundColor = "#1E5A84";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <i className="fas fa-save me-2"></i>
                  Update Price 4
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cost Modal */}
      {showEditCostModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg w-50"
            role="document"
          >
            <div className="modal-content shadow-lg border-0">
              {/* Header with gradient background */}
              <div
                className="modal-header text-white position-relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
              >
                <div className="d-flex align-items-center">
                  <div>
                    <h5 className="modal-title mb-0">Edit Cost</h5>
                    <small className="opacity-75">
                      Modify Cost for item
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white p-4"
                  onClick={handleCloseCostModal}
                  aria-label="Close"
                ></button>

                {/* Decorative elements */}
                <div
                  className="position-absolute"
                  style={{
                    top: "-50px",
                    right: "-50px",
                    width: "100px",
                    height: "100px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                  }}
                ></div>
                <div
                  className="position-absolute"
                  style={{
                    bottom: "-30px",
                    left: "-30px",
                    width: "60px",
                    height: "60px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "50%",
                  }}
                ></div>
              </div>

              <div className="modal-body p-4">
                <form>
                  <div className="row g-3">
                    {/* Current Special Price (Read-only) */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted small">
                        <i
                          className="fas fa-tag me-2"
                          style={{ color: "#1E5A84" }}
                        ></i>
                        Current Cost
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            backgroundColor: "#f8f9fa",
                            color: "#495057",
                          }}
                        >
                          ₱
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={currentCost}
                          disabled
                          style={{
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            fontSize: "0.95rem",
                            fontWeight: "500",
                          }}
                        />
                      </div>
                    </div>

                    {/* New Cost */}
                    <div className="col-12">
                      <label
                        htmlFor="newCost"
                        className="form-label fw-semibold text-muted small"
                      >
                        <i
                          className="fas fa-star me-2"
                          style={{ color: "#1E5A84" }}
                        ></i>
                        New Cost
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ backgroundColor: "#fff", color: "#495057" }}
                        >
                          ₱
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          id="newCost"
                          className="form-control"
                          placeholder="0.00"
                          value={newCost}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => setNewCost(e.target.value)}
                          style={{
                            border: "1px solid #e9ecef",
                            fontSize: "0.95rem",
                            transition: "border-color 0.3s ease",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#1E5A84")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "#e9ecef")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </form>

                {/* Price Change Indicator */}
                {currentCost &&
                  newCost &&
                  currentCost !== newCost && (
                    <div
                      className="mt-4 p-3 rounded-3"
                      style={{
                        backgroundColor:
                          parseFloat(newCost) <
                          parseFloat(currentCost)
                            ? "rgba(25, 135, 84, 0.1)"
                            : parseFloat(newCost) >
                                parseFloat(currentCost)
                              ? "rgba(255, 193, 7, 0.1)"
                              : "rgba(12, 29, 97, 0.05)",
                        border: `1px solid ${
                          parseFloat(newCost) <
                          parseFloat(currentCost)
                            ? "rgba(25, 135, 84, 0.2)"
                            : parseFloat(newCost) >
                                parseFloat(currentCost)
                              ? "rgba(255, 193, 7, 0.2)"
                              : "rgba(12, 29, 97, 0.1)"
                        }`,
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i
                          className={`fas ${
                            parseFloat(newCost) <
                            parseFloat(currentCost)
                              ? "fa-arrow-down text-success"
                              : parseFloat(newCost) >
                                  parseFloat(currentCost)
                                ? "fa-arrow-up text-warning"
                                : "fa-equals text-secondary"
                          } me-2`}
                        ></i>
                        <small className="text-muted">
                          <strong>Price Change: </strong>
                          {parseFloat(newCost) >
                          parseFloat(currentCost)
                            ? "+"
                            : ""}
                          ₱
                          {(
                            parseFloat(newCost) -
                            parseFloat(currentCost)
                          ).toFixed(2)}
                          {parseFloat(newCost) <
                            parseFloat(currentCost) &&
                            " (Price Decrease)"}
                          {parseFloat(newCost) >
                            parseFloat(currentCost) &&
                            " (Price Increase)"}
                        </small>
                      </div>
                    </div>
                  )}

                {/* Info card */}
                <div
                  className="mt-4 p-3 rounded-3"
                  style={{
                    backgroundColor: "rgba(12, 29, 97, 0.05)",
                    border: "1px solid rgba(12, 29, 97, 0.1)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className="fas fa-info-circle me-2"
                      style={{ color: "#1E5A84" }}
                    ></i>
                    <small className="text-muted">
                      Changes will be applied immediately. Make sure the new
                      cost is accurate before saving.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-0 rounded-bottom">
                <button
                  type="button"
                  className="btn px-4 py-2 me-2"
                  onClick={() => setShowEditCostModal(false)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#c82333";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#dc3545";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn px-4 py-2"
                  onClick={handleSubmitCost}
                  disabled={!newCost}
                  style={{
                    backgroundColor: !newCost ? "#6c757d" : "#1E5A84",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    cursor: !newCost ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (newCost) {
                      e.target.style.backgroundColor = "#1e3c72";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newCost) {
                      e.target.style.backgroundColor = "#1E5A84";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <i className="fas fa-save me-2"></i>
                  Update Cost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetails;
