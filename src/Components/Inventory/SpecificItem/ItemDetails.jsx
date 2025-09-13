import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import axios from "axios";

function ItemDetails({ item, onUpdate }) {
  const user = JSON.parse(localStorage.getItem("user"));
  // Edit Stock
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockData, setStockData] = useState();

  const [formData, setFormData] = useState({
    itemCode: item.itemCode || "",
    itemName: item.itemName || "",
    partNo: item.partNum || "",
    interchangeNo: item.interNum || "",
    unit: item.unit || "",
    minStock: item.minStock || "",
    category: item.category || "",
    model: item.model || "",
    brand: item.brand || "",
  });

  useEffect(() => {
    setFormData({
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      partNo: item.partNo || "",
      interchangeNo: item.interchangeNo || "",
      unit: item.unit || "",
      minStock: item.minStock || "",
      category: item.category || "",
      model: item.model || "",
      brand: item.brand || "",
    });
  }, [item]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/inventory/update-inventory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: item.itemName,
          brand: formData.brand,
          minStock: formData.minStock,
          partNum: formData.partNo,
          interNum: formData.interchangeNo,
          unit: formData.unit,
          model: formData.model,
          category: formData.category,
        }),
      });

    

      if (!response.ok) throw new Error("Failed to update item");

      console.log("Item updated successfully");
      alert("Item details updated!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating item details");
    }
  };

  const handleStockUpdate = async () => {
    try {
      const PIC = user.firstName || "";
      const response = await axios.get("http://localhost:3000/inventory/adjust-stock", {
        params: {
          itemName: item.itemName,
          PIC: PIC,
          stock: stockData.newCount,
          remarks: stockData.remarks,
        },
      });

      console.log("Stock adjusted successfully:", response.data);
      alert("Stock updated successfully!");
      setShowStockModal(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Stock adjustment error:", err);
      alert("Error updating stock.");
    }
  };

  const handleEditStockClick = () => {
    setStockData({
      currentCount: item.stock,
      newCount: "",
      remarks: "",
    });
    setShowStockModal(true);
  };

  // Edit Special Price
  const [showEditSpecialPriceModal, setShowEditSpecialPriceModal] =
    useState(false);
  const [currentSpecialPrice, setCurrentSpecialPrice] = useState("");
  const [newSpecialPrice, setNewSpecialPrice] = useState("");

  const handleEditSpecialPriceClick = (currentPrice) => {
    setCurrentSpecialPrice(currentPrice);
    setNewSpecialPrice(currentPrice);
    setShowEditSpecialPriceModal(true);
  };

  const handleCloseSpecialPriceModal = () => {
    setShowEditSpecialPriceModal(false);
    // Clear form fields when closing
    setCurrentSpecialPrice("");
    setNewSpecialPrice("");
  };

  const handleSubmitSpecialPrice = async () => {
    if (!newSpecialPrice) return;

    try {
      const response = await axios.get("http://localhost:3000/inventory/update-price", {
        params: {
          itemName: item.itemName,
          price: newSpecialPrice,
        },
      });

      console.log("Price 4 updated successfully:", response.data);
      alert("Price 4 updated successfully!");
      handleCloseSpecialPriceModal();
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Price 4 update error:", err);
      alert("Error updating Price 4.");
    }
  };

  return (
    <div>
      {/* First Row */}
      <div className="row mx-4 d-flex align-items-start py-1">
        <div className="col-4">
          <label htmlFor="pid" className="form-label h6">
            Product Code:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="pid"
            value={item.itemCode}
            style={{ backgroundColor: "#e9ecef" }}
            readOnly
          />
        </div>

        {/* name */}
        <div className="col-4">
          <label htmlFor="itemName" className="form-label h6">
            Product Name:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="itemName"
            value={item.itemName}
            style={{ backgroundColor: "#e9ecef" }}
            readOnly
          />
        </div>

        <div className="col-4">
          <label htmlFor="gPrice" className="form-label h6">
            Price 1:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="gPrice"
            value={item.price?.price1}
            style={{ backgroundColor: "#e9ecef" }}
            readOnly
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        {/* stock */}
        <div className="col-4">
          <label htmlFor="Stock" className="form-label h6">
            Stock:
          </label>
          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control form-control-sm me-2"
              id="Stock"
              value={item.stock}
              style={{ backgroundColor: "#e9ecef" }}
              readOnly
            />
            <FaEdit
              onClick={handleEditStockClick}
              style={{ cursor: "pointer", margin: "0px 15px" }}
              color="#0C1D61"
              size={30}
            />
          </div>
        </div>

        <div className="col-4">
          <label htmlFor="model" className="form-label h6">
            Minimum Stock:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="minStock"
            value={formData.minStock}
            onChange={handleChange}
          />
        </div>

        <div className="col-4">
          <label htmlFor="aPrice" className="form-label h6">
            Price 2:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="aPrice"
            value={item.price?.price2}
            style={{ backgroundColor: "#e9ecef" }}
            readOnly
          />
        </div>
      </div>

      {/* Third Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="partNo" className="form-label h6">
            Part No.:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="partNo"
            value={formData.partNo}
            onChange={handleChange}
          />
        </div>
        <div className="col-4">
          <label htmlFor="category" className="form-label h6">
            Category:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        <div className="col-4">
          <label htmlFor="bPrice" className="form-label h6">
            Price 3:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="bPrice"
            value={item.price?.price3}
            style={{ backgroundColor: "#e9ecef" }}
            readOnly
          />
        </div>
      </div>

      {/* Fourth Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="interchangeNo" className="form-label h6">
            Interchange No.:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="interchangeNo"
            value={formData.interchangeNo}
            onChange={handleChange}
          />
        </div>
        <div className="col-4">
          <label htmlFor="brand" className="form-label h6">
            Brand:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="brand"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>
        <div className="col-4">
          <label htmlFor="sPrice" className="form-label h6">
            Price 4:
          </label>
          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control form-control-sm me-2"
              id="sPrice"
              value={item.price?.price4}
              style={{ backgroundColor: "#e9ecef" }}
              readOnly
            />
            <FaEdit
              onClick={() => handleEditSpecialPriceClick(item.price?.price4)}
              style={{ cursor: "pointer", margin: "0px 15px" }}
              color="#0C1D61"
              size={30}
            />
          </div>
        </div>
      </div>

      {/* Final Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="unit" className="form-label h6">
            Unit:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="unit"
            value={formData.unit}
            onChange={handleChange}
          />
        </div>

        <div className="col-4">
          <label htmlFor="model" className="form-label h6">
            Model:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="model"
            value={formData.model}
            onChange={handleChange}
          />
        </div>

        <div className="col-auto d-flex align-items-end ms-auto mt-4">
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: "#198754", // Bootstrap green
              color: "white",
              whiteSpace: "nowrap",
            }}
            onClick={handleSave}
          >
            Save
          </button>
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
                    "linear-gradient(135deg, #0C1D61 0%, #1e3c72 100%)",
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
                        style={{ color: "#0C1D61" }}
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
                        style={{ color: "#0C1D61" }}
                      ></i>
                      New Stock Count
                    </label>
                    <input
                      type="number"
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
                      onFocus={(e) => (e.target.style.borderColor = "#0C1D61")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  {/* Remarks/Reason */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">
                      <i
                        className="fas fa-comment-alt me-2"
                        style={{ color: "#0C1D61" }}
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
                      onFocus={(e) => (e.target.style.borderColor = "#0C1D61")}
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
                      style={{ color: "#0C1D61" }}
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
                        : "#0C1D61",
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
                      e.target.style.backgroundColor = "#0C1D61";
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
                    "linear-gradient(135deg, #0C1D61 0%, #1e3c72 100%)",
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
                          style={{ color: "#0C1D61" }}
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
                          style={{ color: "#0C1D61" }}
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
                          onChange={(e) => setNewSpecialPrice(e.target.value)}
                          style={{
                            border: "1px solid #e9ecef",
                            fontSize: "0.95rem",
                            transition: "border-color 0.3s ease",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#0C1D61")
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
                {currentSpecialPrice &&
                  newSpecialPrice &&
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
                      style={{ color: "#0C1D61" }}
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
                    backgroundColor: !newSpecialPrice ? "#6c757d" : "#0C1D61",
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
                      e.target.style.backgroundColor = "#0C1D61";
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
    </div>
  );
}

export default ItemDetails;
