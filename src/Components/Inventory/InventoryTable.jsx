import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import { IoIosSearch } from "react-icons/io";

// Define table columns
const columns = [
  { name: "Product ID", selector: (row) => row.itemCode, sortable: true },
  { name: "Product Name", selector: (row) => row.itemName, sortable: true },
  { name: "Brand", selector: (row) => row.brand, sortable: true },
  { name: "Origin", selector: (row) => row.origin, sortable: true },
  { name: "Stock", selector: (row) => row.stock, sortable: true },
  {
    name: "Cost per product",
    selector: (row) => row.price1,
    sortable: true,
  },
];

function InventoryTable({ products = [], onAddItem = () => {} }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [brand, setBrand] = useState("");
  const [origin, setOrigin] = useState("");
  const [minimumStock, setMinimumStock] = useState("");

  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    setFilteredData(Object.values(products));
  }, [products]);

  const handleAddItemClick = () => {
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    // Clear form fields when closing
    setItemCode("");
    setItemName("");
    setBrand("");
    setOrigin("");
  };

  const handleSubmitItem = () => {
    if (!itemCode || !itemName || !brand || !origin) return;

    const trimmedItem = {
      itemCode: itemCode.trim(),
      itemName: itemName.trim(),
      brand: brand.trim(),
      origin: origin.trim(),
    };

    if (
      !trimmedItem.itemCode ||
      !trimmedItem.itemName ||
      !trimmedItem.brand ||
      !trimmedItem.origin
    ) {
      alert("Please fill in all item details.");
      return;
    }

    const newItem = {
      ...trimmedItem,
      stock: 0,
      price1: 0,
      price2: 0,
      price3: 0,
      price4: 0,
    };

    onAddItem(newItem);

    // Reset inputs
    setItemCode("");
    setItemName("");
    setBrand("");
    setOrigin("");

    // Close modal and clear fields
    handleCloseItemModal();
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = Object.values(products).filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleRowClick = (row) => {
    console.log("CLICKED", row); // Log the clicked row data
    navigate("/inventory/item", { state: { row } }); // Navigate to the details page with the selected row data
  };

  return (
    <div className="container-fluid">
      <div className="my-3">
        <div
          className="d-flex align-items-center justify-content-between mb-4"
          style={{ gap: "10px" }}
        >
          {/* Search input field */}
          <div className="position-relative w-25 my-0">
            <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              placeholder="Search inventory"
              value={searchTerm}
              onChange={handleSearch}
              className="form-control ps-5 border-2 rounded-3"
            />
          </div>

          {/* Add Item button */}
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: "#0C1D61",
              color: "white",
              whiteSpace: "nowrap",
            }}
            onClick={handleAddItemClick}
          >
            + Add Item
          </button>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          fixedHeader
          fixedHeaderScrollHeight="500px"
          onRowClicked={handleRowClick}
          className="custom-data-table"
        />
      </div>

      {/* Add Item Modal */}
      <div
        className={`modal fade ${showItemModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showItemModal ? "block" : "none" }}
        aria-hidden={!showItemModal}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg w-50">
          <div className="modal-content shadow-lg border-0">
            {/* Header with gradient background */}
            <div
              className="modal-header text-white position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0C1D61 0%, #1e3c72 100%)",
                borderRadius: "0.5rem 0.5rem 0 0",
              }}
            >
              <div className="d-flex align-items-center">
                <div>
                  <h5 className="modal-title mb-0">Add New Item</h5>
                  <small className="opacity-75">
                    Create a new inventory item
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleCloseItemModal}
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
                  {/* Item Code */}
                  <div className="col-md-6">
                    <label
                      htmlFor="itemCode"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-qrcode me-2"
                        style={{ color: "#0C1D61" }}
                      ></i>
                      Item Code
                    </label>
                    <input
                      type="text"
                      id="itemCode"
                      placeholder="Enter item code"
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value)}
                      className="form-control"
                      required
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

                  {/* Item Name */}
                  <div className="col-md-6">
                    <label
                      htmlFor="itemName"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-box me-2"
                        style={{ color: "#0C1D61" }}
                      ></i>
                      Item Name
                    </label>
                    <input
                      type="text"
                      id="itemName"
                      placeholder="Enter item name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="form-control"
                      required
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

                  {/* Brand */}
                  <div className="col-md-6">
                    <label
                      htmlFor="brand"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-tag me-2"
                        style={{ color: "#0C1D61" }}
                      ></i>
                      Brand
                    </label>
                    <input
                      type="text"
                      id="brand"
                      placeholder="Enter brand name"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="form-control"
                      required
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

                  {/* Origin */}
                  <div className="col-md-6">
                    <label
                      htmlFor="origin"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-globe me-2"
                        style={{ color: "#0C1D61" }}
                      ></i>
                      Origin
                    </label>
                    <input
                      type="text"
                      id="origin"
                      placeholder="Enter origin/country"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="form-control"
                      required
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

                  {/* Minimum Stock */}
                  <div className="col-md-6">
                    <label
                      htmlFor="minimumStock"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-exclamation-triangle me-2"
                        style={{ color: "#0C1D61" }}
                      ></i>
                      Minimum Stock
                    </label>
                    <input
                      type="number"
                      id="minimumStock"
                      placeholder="Enter minimum stock level"
                      value={minimumStock}
                      onChange={(e) => setMinimumStock(e.target.value)}
                      className="form-control"
                      min="0"
                      required
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
                </div>
              </form>

              {/* Additional info card */}
              <div
                className="mt-4 p-3 rounded-3"
                style={{
                  backgroundColor: "rgba(12, 29, 97, 0.05)",
                  border: "1px solid rgba(12, 29, 97, 0.1)",
                }}
              >
                <div className="d-flex align-items-start">
                  <i
                    className="fas fa-info-circle me-2 mt-1"
                    style={{ color: "#0C1D61" }}
                  ></i>
                  <div>
                    <small className="text-muted d-block">
                      Make sure the item code is unique in your inventory.
                    </small>
                    <small className="text-muted">
                      The minimum stock level will help you track when to
                      restock this item.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-0 rounded-bottom">
              <button
                  type="button"
                  className="btn px-4 py-2 me-2"
                  onClick={handleCloseItemModal}
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
                onClick={handleSubmitItem}
                disabled={
                  !itemCode || !itemName || !brand || !origin || !minimumStock
                }
                style={{
                  backgroundColor:
                    !itemCode || !itemName || !brand || !origin || !minimumStock
                      ? "#6c757d"
                      : "#0C1D61",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  cursor:
                    !itemCode || !itemName || !brand || !origin || !minimumStock
                      ? "not-allowed"
                      : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (
                    !(
                      !itemCode ||
                      !itemName ||
                      !brand ||
                      !origin ||
                      !minimumStock
                    )
                  ) {
                    e.target.style.backgroundColor = "#1e3c72";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    !(
                      !itemCode ||
                      !itemName ||
                      !brand ||
                      !origin ||
                      !minimumStock
                    )
                  ) {
                    e.target.style.backgroundColor = "#0C1D61";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop for Add Item */}
      {showItemModal && (
        <div
          className="modal-backdrop fade show"
          onClick={handleCloseItemModal}
        ></div>
      )}
    </div>
  );
}

export default InventoryTable;
