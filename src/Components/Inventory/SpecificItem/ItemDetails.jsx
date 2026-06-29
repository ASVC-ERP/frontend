import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import showAlert from "../../Swal";
import "./ItemDetails.css"

function ItemDetails({ item, onUpdate }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
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


  const minStock = Number(itemData.minStock || itemData.min_stock || 0);
  const stock = Number(itemData.stock || 0);
  
  const stockStatusClass =
    stock === 0 ? "danger" : stock <= minStock ? "pending" : "success";
  
  const stockStatusText =
    stock === 0 ? "Out of Stock" : stock <= minStock ? "Low Stock" : "In Stock";
  
  return (
    <>
      <div className="item-details-card">
        <div className="item-details-header">
          <div>
            <div className="item-details-kicker">Product Details</div>
            <h2 className="item-details-title">
              {itemData.itemCode || itemData.item_code}
            </h2>
            <p className="item-details-subtitle">
              {itemData.itemName || itemData.item_name}
            </p>
          </div>
  
          <div className="item-details-actions">
            {isAdmin && (
              <button className="btn-primary-custom" onClick={handleSave}>
                Save Changes
              </button>
            )}
          </div>
        </div>
  
        <div className="item-form-grid top">
          <div className="item-field">
            <label>Product Code</label>
            <input
              readOnly
              value={itemData.itemCode || itemData.item_code || ""}
            />
          </div>
  
          <div className="item-field span-2">
            <label>Product Name</label>
            <input
              id="itemName"
              value={formData.itemName || formData.item_name || ""}
              onChange={handleChange}
              readOnly={!isAdmin}
            />
          </div>
  
          <div className="item-field">
            <label>Unit</label>
            <input
              id="unit"
              value={formData.unit || ""}
              onChange={handleChange}
              readOnly={!isAdmin}
            />
          </div>
        </div>
      </div>
  
      <div className="item-details-card">
        <div className="item-section-header">
          <h3>Metadata</h3>
        </div>
  
        <div className="item-form-grid">
          {[
            { label: "Part No.", id: "partNum", value: formData.partNum || formData.part_num },
            { label: "Model", id: "model", value: formData.model },
            { label: "Interchange No.", id: "interNum", value: formData.interNum || formData.internal_num },
            { label: "Brand", id: "brand", value: formData.brand },
            { label: "Origin", id: "origin", value: formData.origin },
            { label: "Min. Stock", id: "minStock", value: formData.minStock || formData.min_stock },
          ].map(({ label, id, value }) => (
            <div className="item-field" key={id}>
              <label>{label}</label>
              <input
                id={id}
                value={value || ""}
                onChange={handleChange}
                readOnly={!isAdmin}
              />
            </div>
          ))}
        </div>
      </div>
  
      <div className="item-details-card">
        <div className="item-section-header">
          <h3>Pricing & Inventory</h3>
        </div>
  
        <div className="item-pricing-grid">
          <div className="item-price-card">
            <span>Cost</span>
            <strong>₱ {itemData.cost || 0}</strong>
  
            {isAdmin && (
              <button onClick={handleEditCostClick}>
                <FaEdit size={14} />
              </button>
            )}
          </div>
  
          {[
            { label: "Price 1", value: itemData.price1 },
            { label: "Price 2", value: itemData.price2 },
            { label: "Price 3", value: itemData.price3 },
          ].map(({ label, value }) => (
            <div className="item-price-card" key={label}>
              <span>{label}</span>
              <strong>₱ {value || 0}</strong>
            </div>
          ))}
  
          <div className="item-price-card">
            <span>Price 4</span>
            <strong>₱ {itemData.price4 || 0}</strong>
  
            {isAdmin && (
              <button onClick={handleEditSpecialPriceClick}>
                <FaEdit size={14} />
              </button>
            )}
          </div>
  
          <div className="item-price-card stock">
            <span>Stock</span>
            <strong>
              {itemData.stock || 0} {itemData.unit}/s
            </strong>
  
            {isAdmin && (
              <button onClick={handleEditStockClick}>
                <FaEdit size={14} />
              </button>
            )}
  
            <small>
              {itemData.stock === 0
                ? "Out of stock"
                : itemData.stock <= (itemData.minStock || itemData.min_stock)
                ? "Low stock"
                : "In stock"}
            </small>
          </div>
        </div>
      </div>

      {showStockModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal app-modal-md">
            <div className="app-modal-content">

              {/* Header */}
              <div className="app-modal-header">
                <div>
                  <h5>Update Stock Count</h5>
                  <span>Modify inventory stock levels</span>
                </div>

                <button
                  className="app-modal-close"
                  onClick={() => setShowStockModal(false)}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="app-modal-body">
                <form className="modal-form">

                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Stock Information
                    </div>

                    <div className="row g-3">

                      <div className="col-12">
                        <label className="form-label">
                          Current Stock Count
                        </label>

                        <input
                          className="form-control"
                          value={stockData.currentCount}
                          disabled
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">
                          New Stock Count
                        </label>

                        <input
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          className="form-control"
                          value={stockData.newCount}
                          onChange={(e) =>
                            setStockData({
                              ...stockData,
                              newCount: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">
                          Reason for Stock Change
                        </label>

                        <textarea
                          className="form-control"
                          rows={4}
                          placeholder="Enter reason..."
                          value={stockData.remarks}
                          onChange={(e) =>
                            setStockData({
                              ...stockData,
                              remarks: e.target.value,
                            })
                          }
                        />
                      </div>

                    </div>
                  </div>

                  {stockData.newCount && stockData.currentCount && (
                    <div className="modal-form-section">
                      <div className="modal-form-section-title">
                        Stock Summary
                      </div>

                      <p className="mb-0">
                        <strong>Stock Change:</strong>{" "}
                        {Number(stockData.newCount) -
                          Number(stockData.currentCount) >
                        0
                          ? "+"
                          : ""}
                        {Number(stockData.newCount) -
                          Number(stockData.currentCount)}
                      </p>

                      <small className="text-muted">
                        {Number(stockData.newCount) >
                        Number(stockData.currentCount)
                          ? "Stock Increase"
                          : Number(stockData.newCount) <
                              Number(stockData.currentCount)
                          ? "Stock Decrease"
                          : "No Change"}
                      </small>
                    </div>
                  )}

                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Note
                    </div>

                    <small className="text-muted">
                      Stock updates will be logged with timestamp and user
                      information for audit purposes.
                    </small>
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="app-modal-footer">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={() => setShowStockModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-primary-custom"
                  onClick={handleStockUpdate}
                  disabled={!stockData.newCount || !stockData.remarks}
                >
                  Update Stock
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Special Price Modal */}
      {showEditSpecialPriceModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal app-modal-md">
            <div className="app-modal-content">

              {/* Header */}
              <div className="app-modal-header">
                <div>
                  <h5>Edit Price 4</h5>
                  <span>Modify Price 4 for this item</span>
                </div>

                <button
                  className="app-modal-close"
                  onClick={handleCloseSpecialPriceModal}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="app-modal-body">
                <form className="modal-form">

                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Price Information
                    </div>

                    <div className="row g-3">

                      <div className="col-12">
                        <label className="form-label">
                          Current Price 4
                        </label>

                        <div className="input-group">
                          <span className="input-group-text">₱</span>

                          <input
                            className="form-control"
                            value={currentSpecialPrice}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label">
                          New Price 4
                        </label>

                        <div className="input-group">
                          <span className="input-group-text">₱</span>

                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            placeholder="0.00"
                            value={newSpecialPrice}
                            onWheel={(e) => e.target.blur()}
                            onChange={(e) =>
                              setNewSpecialPrice(e.target.value)
                            }
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {currentSpecialPrice != null &&
                    newSpecialPrice != null &&
                    currentSpecialPrice !== newSpecialPrice && (
                      <div className="modal-form-section">
                        <div className="modal-form-section-title">
                          Price Summary
                        </div>

                        <p className="mb-1">
                          <strong>Price Change:</strong>{" "}
                          {parseFloat(newSpecialPrice) >
                          parseFloat(currentSpecialPrice)
                            ? "+"
                            : ""}
                          ₱
                          {(
                            parseFloat(newSpecialPrice) -
                            parseFloat(currentSpecialPrice)
                          ).toFixed(2)}
                        </p>

                        <small className="text-muted">
                          {parseFloat(newSpecialPrice) <
                          parseFloat(currentSpecialPrice)
                            ? "Price Decrease"
                            : parseFloat(newSpecialPrice) >
                              parseFloat(currentSpecialPrice)
                            ? "Price Increase"
                            : "No Change"}
                        </small>
                      </div>
                    )}

                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Note
                    </div>

                    <small className="text-muted">
                      Changes will be applied immediately. Make sure the new
                      price is accurate before saving.
                    </small>
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="app-modal-footer">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={() =>
                    setShowEditSpecialPriceModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-primary-custom"
                  onClick={handleSubmitSpecialPrice}
                  disabled={!newSpecialPrice}
                >
                  Update Price 4
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Cost Modal */}
      {showEditCostModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal app-modal-md">
            <div className="app-modal-content">

              {/* Header */}
              <div className="app-modal-header">
                <div>
                  <h5>Edit Cost</h5>
                  <span>Modify cost for this item</span>
                </div>

                <button
                  className="app-modal-close"
                  onClick={handleCloseCostModal}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="app-modal-body">
                <form className="modal-form">

                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Cost Information
                    </div>

                    <div className="row g-3">

                      <div className="col-12">
                        <label className="form-label">
                          Current Cost
                        </label>

                        <div className="input-group">
                          <span className="input-group-text">₱</span>

                          <input
                            className="form-control"
                            value={currentCost}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label">
                          New Cost
                        </label>

                        <div className="input-group">
                          <span className="input-group-text">₱</span>

                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            placeholder="0.00"
                            value={newCost}
                            onWheel={(e) => e.target.blur()}
                            onChange={(e) => setNewCost(e.target.value)}
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {currentCost != null &&
                    newCost != null &&
                    currentCost !== newCost && (
                      <div className="modal-form-section">
                        <div className="modal-form-section-title">
                          Cost Summary
                        </div>

                        <p className="mb-1">
                          <strong>Cost Change:</strong>{" "}
                          {parseFloat(newCost) >
                          parseFloat(currentCost)
                            ? "+"
                            : ""}
                          ₱
                          {(
                            parseFloat(newCost) -
                            parseFloat(currentCost)
                          ).toFixed(2)}
                        </p>

                        <small className="text-muted">
                          {parseFloat(newCost) <
                          parseFloat(currentCost)
                            ? "Cost Decrease"
                            : parseFloat(newCost) >
                              parseFloat(currentCost)
                            ? "Cost Increase"
                            : "No Change"}
                        </small>
                      </div>
                    )}

                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Note
                    </div>

                    <small className="text-muted">
                      Changes will be applied immediately. Make sure the new
                      cost is accurate before saving.
                    </small>
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="app-modal-footer">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={() => setShowEditCostModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-primary-custom"
                  onClick={handleSubmitCost}
                  disabled={!newCost}
                >
                  Update Cost
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ItemDetails;
