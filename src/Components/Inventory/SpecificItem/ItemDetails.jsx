import { useState } from "react";

function ItemDetails({ item }) {
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockData, setStockData] = useState({
    currentCount: 100, // replace with actual value
    newCount: "",
    remarks: "",
  });

  const handleStockUpdate = () => {
    // Add validation or API logic here
    console.log("Updated Stock:", stockData.newCount);
    console.log("Reason:", stockData.remarks);
    setShowStockModal(false);
  };

  return (
    <div>
      {/* First Row */}
      <div className="row mx-4 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="pid" className="form-label h6">
            Product ID:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="pid"
            value={item.itemCode}
          />
        </div>
        <div className="col-4">
          <label htmlFor="size" className="form-label h6">
            Size:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="size"
            value={item.size}
          />
        </div>
        <div className="col-4">
          <label htmlFor="gPrice" className="form-label h6">
            Gross Price:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="gPrice"
            value={item.price1}
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="itemName" className="form-label h6">
            Item Name:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="itemName"
            value={item.itemName}
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
            value={item.model}
          />
        </div>
        <div className="col-4">
          <label htmlFor="aPrice" className="form-label h6">
            Net-A Price:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="aPrice"
            value={item.price2}
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
            value={item.partNo}
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
            value={item.category}
          />
        </div>
        <div className="col-4">
          <label htmlFor="bPrice" className="form-label h6">
            Net-B Price:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="bPrice"
            value={item.price3}
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
            value={item.interchangeNo}
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
            value={item.brand}
          />
        </div>
        <div className="col-4">
          <label htmlFor="sPrice" className="form-label h6">
            Special Price:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="sPrice"
            value={item.price4}
          />
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
            value={item.unit}
          />
        </div>

        <div className="col-auto d-flex align-items-end ms-auto mt-3 me-5">
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: "#0C1D61",
              color: "white",
              whiteSpace: "nowrap",
            }}
            onClick={() => setShowStockModal(true)}
          >
            Stock Count
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
                  className="btn-close btn-close-white"
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
    </div>
  );
}

export default ItemDetails;
