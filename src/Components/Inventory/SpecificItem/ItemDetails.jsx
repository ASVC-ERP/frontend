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
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Stock Count</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStockModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Current Stock"
                  value={stockData.currentCount}
                  disabled
                />
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="New Stock Count"
                  value={stockData.newCount}
                  onChange={(e) =>
                    setStockData({ ...stockData, newCount: e.target.value })
                  }
                />
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Reason for stock change"
                  value={stockData.remarks}
                  onChange={(e) =>
                    setStockData({ ...stockData, remarks: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowStockModal(false)}
                  style={{ backgroundColor: "#B64345", color: "white" }}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  style={{
                    backgroundColor: "#0C1D61",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                  onClick={handleStockUpdate}
                >
                  Save
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
